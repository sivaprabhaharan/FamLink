using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamLink.Api.Data;
using FamLink.Api.Models;

namespace FamLink.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly FamLinkDbContext _context;
        private readonly ILogger<ChatbotController> _logger;
        // TODO: Add AI service dependency injection here
        // private readonly IAIService _aiService;

        public ChatbotController(FamLinkDbContext context, ILogger<ChatbotController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/chatbot/conversations/user/{userId}
        [HttpGet("conversations/user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserConversations(
            Guid userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || !user.IsActive)
                {
                    return NotFound("User not found");
                }

                var totalCount = await _context.ChatbotConversations
                    .Where(c => c.UserId == userId && c.IsActive)
                    .CountAsync();

                var conversations = await _context.ChatbotConversations
                    .Include(c => c.Child)
                    .Where(c => c.UserId == userId && c.IsActive)
                    .OrderByDescending(c => c.UpdatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new
                    {
                        c.Id,
                        c.SessionId,
                        c.CreatedAt,
                        c.UpdatedAt,
                        c.LastMessageTime,
                        c.MessageCount,
                        Child = c.Child != null ? new
                        {
                            c.Child.Id,
                            c.Child.FirstName,
                            c.Child.LastName,
                            c.Child.AgeInYears
                        } : null,
                        LastMessage = c.MessagesList.LastOrDefault()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Conversations = conversations,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving conversations for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/chatbot/conversations/{id}
        [HttpGet("conversations/{id}")]
        public async Task<ActionResult<object>> GetConversation(Guid id)
        {
            try
            {
                var conversation = await _context.ChatbotConversations
                    .Include(c => c.User)
                    .Include(c => c.Child)
                    .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

                if (conversation == null)
                {
                    return NotFound();
                }

                var conversationResponse = new
                {
                    conversation.Id,
                    conversation.SessionId,
                    conversation.CreatedAt,
                    conversation.UpdatedAt,
                    conversation.MessagesList,
                    conversation.MessageCount,
                    User = new
                    {
                        conversation.User.Id,
                        conversation.User.FirstName,
                        conversation.User.LastName
                    },
                    Child = conversation.Child != null ? new
                    {
                        conversation.Child.Id,
                        conversation.Child.FirstName,
                        conversation.Child.LastName,
                        conversation.Child.AgeInYears,
                        conversation.Child.AgeInMonths,
                        conversation.Child.Gender,
                        conversation.Child.Allergies,
                        conversation.Child.MedicalConditions
                    } : null
                };

                return Ok(conversationResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving conversation {ConversationId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/chatbot/conversations
        [HttpPost("conversations")]
        public async Task<ActionResult<object>> StartConversation(StartConversationRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null || !user.IsActive)
                {
                    return BadRequest("Invalid user");
                }

                Child? child = null;
                if (request.ChildId.HasValue)
                {
                    child = await _context.Children.FindAsync(request.ChildId.Value);
                    if (child == null || !child.IsActive || child.ParentId != request.UserId)
                    {
                        return BadRequest("Invalid child");
                    }
                }

                var sessionId = Guid.NewGuid().ToString();
                var conversation = new ChatbotConversation
                {
                    UserId = request.UserId,
                    ChildId = request.ChildId,
                    SessionId = sessionId,
                    MessagesList = new List<ChatMessage>()
                };

                // Add initial system message with context
                var systemMessage = new ChatMessage
                {
                    Role = "system",
                    Content = GenerateSystemPrompt(child),
                    Timestamp = DateTime.UtcNow
                };

                conversation.MessagesList.Add(systemMessage);

                _context.ChatbotConversations.Add(conversation);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetConversation), new { id = conversation.Id }, new
                {
                    conversation.Id,
                    conversation.SessionId,
                    conversation.CreatedAt,
                    conversation.UpdatedAt,
                    Child = child != null ? new
                    {
                        child.Id,
                        child.FirstName,
                        child.LastName,
                        child.AgeInYears
                    } : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting conversation");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/chatbot/conversations/{id}/messages
        [HttpPost("conversations/{id}/messages")]
        public async Task<ActionResult<object>> SendMessage(Guid id, SendMessageRequest request)
        {
            try
            {
                var conversation = await _context.ChatbotConversations
                    .Include(c => c.Child)
                    .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

                if (conversation == null)
                {
                    return NotFound("Conversation not found");
                }

                // Add user message
                var userMessage = new ChatMessage
                {
                    Role = "user",
                    Content = request.Message,
                    Timestamp = DateTime.UtcNow
                };

                var messages = conversation.MessagesList;
                messages.Add(userMessage);

                // TODO: Generate AI response using your preferred AI service
                // For now, we'll create a placeholder response
                var aiResponse = await GenerateAIResponse(request.Message, conversation.Child);

                var assistantMessage = new ChatMessage
                {
                    Role = "assistant",
                    Content = aiResponse.Content,
                    Evidence = aiResponse.Evidence,
                    Sources = aiResponse.Sources,
                    Timestamp = DateTime.UtcNow
                };

                messages.Add(assistantMessage);
                conversation.MessagesList = messages;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    UserMessage = userMessage,
                    AssistantMessage = assistantMessage,
                    ConversationId = conversation.Id,
                    SessionId = conversation.SessionId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message to conversation {ConversationId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/chatbot/conversations/{id}
        [HttpDelete("conversations/{id}")]
        public async Task<IActionResult> DeleteConversation(Guid id)
        {
            try
            {
                var conversation = await _context.ChatbotConversations.FindAsync(id);

                if (conversation == null)
                {
                    return NotFound();
                }

                // Soft delete
                conversation.IsActive = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting conversation {ConversationId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/chatbot/health-tips
        [HttpGet("health-tips")]
        public ActionResult<IEnumerable<object>> GetHealthTips([FromQuery] int? ageInMonths = null)
        {
            try
            {
                var tips = GenerateHealthTips(ageInMonths);
                return Ok(tips);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving health tips");
                return StatusCode(500, "Internal server error");
            }
        }

        // Private helper methods
        private string GenerateSystemPrompt(Child? child)
        {
            var prompt = @"You are Dr. FamLink, a knowledgeable and caring pediatrician AI assistant. 
                          You provide evidence-based medical advice and health information for children and families.
                          
                          Guidelines:
                          - Always provide evidence-based information
                          - Include sources when possible
                          - Be empathetic and understanding
                          - Recommend consulting healthcare professionals for serious concerns
                          - Focus on preventive care and healthy lifestyle advice
                          - Use age-appropriate recommendations";

            if (child != null)
            {
                prompt += $@"
                          
                          Current child context:
                          - Name: {child.FirstName}
                          - Age: {child.AgeInYears} years ({child.AgeInMonths} months)
                          - Gender: {child.Gender}";

                if (!string.IsNullOrEmpty(child.Allergies))
                {
                    prompt += $"\n- Known allergies: {child.Allergies}";
                }

                if (!string.IsNullOrEmpty(child.MedicalConditions))
                {
                    prompt += $"\n- Medical conditions: {child.MedicalConditions}";
                }
            }

            return prompt;
        }

        private async Task<AIResponse> GenerateAIResponse(string userMessage, Child? child)
        {
            // TODO: Implement actual AI service integration
            // This is a placeholder implementation
            
            await Task.Delay(100); // Simulate API call delay

            // Simple keyword-based responses for demonstration
            var response = new AIResponse();

            if (userMessage.ToLower().Contains("fever"))
            {
                response.Content = @"For fever in children, here are some general guidelines:

                                   • Monitor temperature regularly
                                   • Ensure adequate hydration
                                   • Dress in light clothing
                                   • Consider age-appropriate fever reducers if recommended by your pediatrician
                                   • Seek immediate medical attention if fever is very high or accompanied by concerning symptoms

                                   Please consult your pediatrician for personalized advice, especially for children under 3 months.";
                
                response.Evidence = "Fever management guidelines based on AAP recommendations";
                response.Sources = new List<string> { "American Academy of Pediatrics", "CDC Guidelines" };
            }
            else if (userMessage.ToLower().Contains("vaccination") || userMessage.ToLower().Contains("vaccine"))
            {
                response.Content = @"Vaccinations are crucial for protecting children from serious diseases. 

                                   Key points:
                                   • Follow the recommended vaccination schedule
                                   • Vaccines are safe and effective
                                   • Mild side effects are normal and indicate immune system response
                                   • Keep vaccination records updated

                                   Please consult your pediatrician about your child's vaccination schedule.";
                
                response.Evidence = "Based on CDC vaccination guidelines and WHO recommendations";
                response.Sources = new List<string> { "CDC", "WHO", "American Academy of Pediatrics" };
            }
            else
            {
                response.Content = @"Thank you for your question. As a pediatric AI assistant, I'm here to provide evidence-based health information.

                                   For the best care for your child, I recommend:
                                   • Consulting with your pediatrician for personalized advice
                                   • Keeping up with regular check-ups
                                   • Maintaining a healthy lifestyle with proper nutrition and exercise

                                   Could you please provide more specific details about your concern so I can offer more targeted guidance?";
                
                response.Evidence = "General pediatric care principles";
                response.Sources = new List<string> { "American Academy of Pediatrics" };
            }

            return response;
        }

        private List<object> GenerateHealthTips(int? ageInMonths)
        {
            var tips = new List<object>();

            if (ageInMonths.HasValue)
            {
                if (ageInMonths < 12) // Infants
                {
                    tips.AddRange(new[]
                    {
                        new { Category = "Nutrition", Tip = "Exclusive breastfeeding for first 6 months is recommended", AgeGroup = "0-12 months" },
                        new { Category = "Safety", Tip = "Always place baby on back to sleep", AgeGroup = "0-12 months" },
                        new { Category = "Development", Tip = "Tummy time helps strengthen neck and shoulder muscles", AgeGroup = "0-12 months" }
                    });
                }
                else if (ageInMonths < 24) // Toddlers
                {
                    tips.AddRange(new[]
                    {
                        new { Category = "Nutrition", Tip = "Introduce variety of foods to develop healthy eating habits", AgeGroup = "12-24 months" },
                        new { Category = "Safety", Tip = "Childproof your home as toddlers become more mobile", AgeGroup = "12-24 months" },
                        new { Category = "Development", Tip = "Read to your child daily to support language development", AgeGroup = "12-24 months" }
                    });
                }
                else // Older children
                {
                    tips.AddRange(new[]
                    {
                        new { Category = "Nutrition", Tip = "Encourage balanced meals with fruits and vegetables", AgeGroup = "2+ years" },
                        new { Category = "Activity", Tip = "Ensure at least 60 minutes of physical activity daily", AgeGroup = "2+ years" },
                        new { Category = "Sleep", Tip = "Maintain consistent bedtime routines", AgeGroup = "2+ years" }
                    });
                }
            }
            else
            {
                // General tips
                tips.AddRange(new[]
                {
                    new { Category = "General", Tip = "Regular pediatric check-ups are essential for monitoring growth and development", AgeGroup = "All ages" },
                    new { Category = "General", Tip = "Keep vaccination schedules up to date", AgeGroup = "All ages" },
                    new { Category = "General", Tip = "Practice good hygiene habits including regular handwashing", AgeGroup = "All ages" }
                });
            }

            return tips;
        }
    }

    // Helper classes
    public class AIResponse
    {
        public string Content { get; set; } = string.Empty;
        public string? Evidence { get; set; }
        public List<string>? Sources { get; set; }
    }

    // DTOs for requests
    public class StartConversationRequest
    {
        public Guid UserId { get; set; }
        public Guid? ChildId { get; set; }
    }

    public class SendMessageRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
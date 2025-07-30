namespace FamLink.Api.Services
{
    public interface IAIService
    {
        Task<AIResponse> GenerateResponseAsync(string prompt, string? context = null);
        Task<AIResponse> GeneratePediatricAdviceAsync(string userMessage, ChildContext? childContext = null);
        Task<List<string>> GenerateHealthTipsAsync(int? ageInMonths = null);
        Task<string> SummarizeConversationAsync(List<ChatMessage> messages);
        Task<bool> ValidateHealthQueryAsync(string query);
    }

    public class AIService : IAIService
    {
        private readonly ILogger<AIService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public AIService(ILogger<AIService> logger, IConfiguration configuration, HttpClient httpClient)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<AIResponse> GenerateResponseAsync(string prompt, string? context = null)
        {
            try
            {
                _logger.LogInformation("Generating AI response for prompt length: {PromptLength}", prompt.Length);

                // TODO: Implement actual AI service integration (OpenAI, AWS Bedrock, etc.)
                // This is a placeholder implementation

                await Task.Delay(500); // Simulate API call delay

                var response = new AIResponse
                {
                    Content = GeneratePlaceholderResponse(prompt),
                    Evidence = "Based on medical literature and pediatric guidelines",
                    Sources = new List<string> { "American Academy of Pediatrics", "WHO Guidelines" },
                    Confidence = 0.85f,
                    TokensUsed = prompt.Length / 4 // Rough estimate
                };

                _logger.LogInformation("AI response generated successfully");
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI response");
                throw;
            }
        }

        public async Task<AIResponse> GeneratePediatricAdviceAsync(string userMessage, ChildContext? childContext = null)
        {
            try
            {
                _logger.LogInformation("Generating pediatric advice for message: {MessageLength} chars", userMessage.Length);

                var systemPrompt = BuildPediatricSystemPrompt(childContext);
                var fullPrompt = $"{systemPrompt}\n\nUser Question: {userMessage}";

                // TODO: Implement actual AI service call
                await Task.Delay(800); // Simulate processing time

                var response = new AIResponse
                {
                    Content = GeneratePediatricPlaceholderResponse(userMessage, childContext),
                    Evidence = GenerateEvidenceForQuery(userMessage),
                    Sources = GetRelevantSources(userMessage),
                    Confidence = CalculateConfidence(userMessage),
                    TokensUsed = fullPrompt.Length / 4,
                    IsHealthRelated = true
                };

                _logger.LogInformation("Pediatric advice generated successfully");
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating pediatric advice");
                throw;
            }
        }

        public async Task<List<string>> GenerateHealthTipsAsync(int? ageInMonths = null)
        {
            try
            {
                _logger.LogInformation("Generating health tips for age: {AgeInMonths} months", ageInMonths);

                // TODO: Implement AI-generated health tips
                await Task.Delay(300);

                var tips = new List<string>();

                if (ageInMonths.HasValue)
                {
                    if (ageInMonths < 12)
                    {
                        tips.AddRange(new[]
                        {
                            "Ensure exclusive breastfeeding for the first 6 months",
                            "Practice safe sleep - always place baby on their back",
                            "Schedule regular pediatric check-ups for growth monitoring",
                            "Provide daily tummy time to strengthen neck and shoulder muscles",
                            "Keep up with vaccination schedule as recommended by your pediatrician"
                        });
                    }
                    else if (ageInMonths < 24)
                    {
                        tips.AddRange(new[]
                        {
                            "Introduce a variety of nutritious solid foods",
                            "Encourage independent eating with finger foods",
                            "Read to your child daily to support language development",
                            "Childproof your home as toddlers become more mobile",
                            "Establish consistent sleep routines"
                        });
                    }
                    else
                    {
                        tips.AddRange(new[]
                        {
                            "Encourage at least 60 minutes of physical activity daily",
                            "Limit screen time and encourage outdoor play",
                            "Teach proper handwashing and hygiene habits",
                            "Provide balanced meals with fruits and vegetables",
                            "Foster social skills through playdates and group activities"
                        });
                    }
                }
                else
                {
                    tips.AddRange(new[]
                    {
                        "Maintain regular pediatric check-ups",
                        "Keep vaccination records up to date",
                        "Practice good hygiene habits",
                        "Ensure adequate sleep for proper growth",
                        "Encourage healthy eating habits from an early age"
                    });
                }

                return tips;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating health tips");
                throw;
            }
        }

        public async Task<string> SummarizeConversationAsync(List<ChatMessage> messages)
        {
            try
            {
                _logger.LogInformation("Summarizing conversation with {MessageCount} messages", messages.Count);

                // TODO: Implement AI-powered conversation summarization
                await Task.Delay(400);

                var userMessages = messages.Where(m => m.Role == "user").ToList();
                var topics = ExtractTopicsFromMessages(userMessages);

                var summary = $"Conversation covered {topics.Count} main topics: {string.Join(", ", topics)}. " +
                             $"Total messages: {messages.Count}. " +
                             $"Duration: {(messages.LastOrDefault()?.Timestamp - messages.FirstOrDefault()?.Timestamp)?.TotalMinutes:F0} minutes.";

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error summarizing conversation");
                throw;
            }
        }

        public async Task<bool> ValidateHealthQueryAsync(string query)
        {
            try
            {
                _logger.LogInformation("Validating health query: {QueryLength} chars", query.Length);

                // TODO: Implement AI-powered query validation
                await Task.Delay(200);

                var healthKeywords = new[]
                {
                    "fever", "cough", "cold", "vaccination", "vaccine", "medicine", "doctor",
                    "hospital", "sick", "illness", "symptom", "treatment", "health", "medical",
                    "pediatric", "child", "baby", "infant", "toddler", "development", "growth",
                    "nutrition", "feeding", "sleep", "rash", "allergy", "pain", "injury"
                };

                var isHealthRelated = healthKeywords.Any(keyword => 
                    query.ToLower().Contains(keyword.ToLower()));

                return isHealthRelated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating health query");
                return false;
            }
        }

        // Private helper methods
        private string BuildPediatricSystemPrompt(ChildContext? childContext)
        {
            var prompt = @"You are Dr. FamLink, a knowledgeable and caring pediatrician AI assistant. 
                          You provide evidence-based medical advice and health information for children and families.
                          
                          Guidelines:
                          - Always provide evidence-based information with sources
                          - Be empathetic and understanding
                          - Recommend consulting healthcare professionals for serious concerns
                          - Focus on preventive care and healthy lifestyle advice
                          - Use age-appropriate recommendations
                          - Never provide emergency medical advice - direct to emergency services";

            if (childContext != null)
            {
                prompt += $@"
                          
                          Current child context:
                          - Age: {childContext.AgeInYears} years ({childContext.AgeInMonths} months)
                          - Gender: {childContext.Gender}";

                if (!string.IsNullOrEmpty(childContext.Allergies))
                {
                    prompt += $"\n- Known allergies: {childContext.Allergies}";
                }

                if (!string.IsNullOrEmpty(childContext.MedicalConditions))
                {
                    prompt += $"\n- Medical conditions: {childContext.MedicalConditions}";
                }
            }

            return prompt;
        }

        private string GeneratePlaceholderResponse(string prompt)
        {
            // Simple keyword-based responses for demonstration
            var lowerPrompt = prompt.ToLower();

            if (lowerPrompt.Contains("hello") || lowerPrompt.Contains("hi"))
            {
                return "Hello! I'm Dr. FamLink, your pediatric AI assistant. How can I help you with your child's health today?";
            }

            return "Thank you for your question. As a pediatric AI assistant, I'm here to provide evidence-based health information. Could you please provide more specific details about your concern?";
        }

        private string GeneratePediatricPlaceholderResponse(string userMessage, ChildContext? childContext)
        {
            var lowerMessage = userMessage.ToLower();

            if (lowerMessage.Contains("fever"))
            {
                var ageSpecificAdvice = childContext?.AgeInMonths < 3 
                    ? "For infants under 3 months, any fever requires immediate medical attention."
                    : "Monitor temperature regularly and ensure adequate hydration.";

                return $@"For fever management in children:

• {ageSpecificAdvice}
• Dress in light, comfortable clothing
• Offer plenty of fluids
• Consider age-appropriate fever reducers as recommended by your pediatrician
• Seek medical attention if fever is very high or accompanied by concerning symptoms

Please consult your pediatrician for personalized advice.";
            }

            if (lowerMessage.Contains("vaccination") || lowerMessage.Contains("vaccine"))
            {
                return @"Vaccinations are crucial for protecting children from serious diseases:

• Follow the recommended vaccination schedule
• Vaccines are safe and effective
• Mild side effects are normal and indicate immune system response
• Keep vaccination records updated
• Discuss any concerns with your pediatrician

Your child's vaccination schedule should be tailored to their age and health status.";
            }

            return @"Thank you for your question. For the best care for your child, I recommend:

• Consulting with your pediatrician for personalized advice
• Keeping up with regular check-ups
• Maintaining a healthy lifestyle with proper nutrition and exercise

Could you please provide more specific details about your concern so I can offer more targeted guidance?";
        }

        private string GenerateEvidenceForQuery(string query)
        {
            var lowerQuery = query.ToLower();

            if (lowerQuery.Contains("fever"))
                return "Based on American Academy of Pediatrics fever management guidelines";
            if (lowerQuery.Contains("vaccination"))
                return "According to CDC vaccination recommendations and WHO guidelines";
            if (lowerQuery.Contains("nutrition"))
                return "Based on pediatric nutrition guidelines from AAP and WHO";

            return "Based on current pediatric medical literature and evidence-based practices";
        }

        private List<string> GetRelevantSources(string query)
        {
            var sources = new List<string> { "American Academy of Pediatrics" };

            var lowerQuery = query.ToLower();
            if (lowerQuery.Contains("vaccination")) sources.Add("CDC");
            if (lowerQuery.Contains("nutrition")) sources.Add("WHO");
            if (lowerQuery.Contains("development")) sources.Add("Child Development Institute");

            return sources;
        }

        private float CalculateConfidence(string query)
        {
            // Simple confidence calculation based on query specificity
            var specificKeywords = new[] { "fever", "vaccination", "nutrition", "development", "sleep" };
            var hasSpecificKeywords = specificKeywords.Any(k => query.ToLower().Contains(k));

            return hasSpecificKeywords ? 0.85f : 0.65f;
        }

        private List<string> ExtractTopicsFromMessages(List<ChatMessage> userMessages)
        {
            var topics = new List<string>();
            var allText = string.Join(" ", userMessages.Select(m => m.Content)).ToLower();

            var topicKeywords = new Dictionary<string, string[]>
            {
                { "Fever Management", new[] { "fever", "temperature", "hot" } },
                { "Vaccinations", new[] { "vaccine", "vaccination", "immunization" } },
                { "Nutrition", new[] { "food", "eating", "nutrition", "feeding" } },
                { "Development", new[] { "development", "milestone", "growth" } },
                { "Sleep", new[] { "sleep", "bedtime", "nap" } }
            };

            foreach (var topic in topicKeywords)
            {
                if (topic.Value.Any(keyword => allText.Contains(keyword)))
                {
                    topics.Add(topic.Key);
                }
            }

            return topics.Any() ? topics : new List<string> { "General Health" };
        }
    }

    // Supporting classes
    public class AIResponse
    {
        public string Content { get; set; } = string.Empty;
        public string? Evidence { get; set; }
        public List<string>? Sources { get; set; }
        public float Confidence { get; set; }
        public int TokensUsed { get; set; }
        public bool IsHealthRelated { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class ChildContext
    {
        public string FirstName { get; set; } = string.Empty;
        public int AgeInYears { get; set; }
        public int AgeInMonths { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string? Allergies { get; set; }
        public string? MedicalConditions { get; set; }
    }

    public class ChatMessage
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Evidence { get; set; }
        public List<string>? Sources { get; set; }
    }
}
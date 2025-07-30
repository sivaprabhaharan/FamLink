using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamLink.Api.Models
{
    public class ChatbotConversation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        public Guid? ChildId { get; set; }

        [Required]
        [StringLength(255)]
        public string SessionId { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string Messages { get; set; } = string.Empty; // JSON array of messages

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("ChildId")]
        public virtual Child? Child { get; set; }

        [NotMapped]
        public List<ChatMessage> MessagesList
        {
            get
            {
                if (string.IsNullOrEmpty(Messages))
                    return new List<ChatMessage>();
                
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<List<ChatMessage>>(Messages) ?? new List<ChatMessage>();
                }
                catch
                {
                    return new List<ChatMessage>();
                }
            }
            set
            {
                Messages = System.Text.Json.JsonSerializer.Serialize(value);
            }
        }

        [NotMapped]
        public DateTime LastMessageTime
        {
            get
            {
                var messages = MessagesList;
                return messages.Any() ? messages.Max(m => m.Timestamp) : CreatedAt;
            }
        }

        [NotMapped]
        public int MessageCount => MessagesList.Count;
    }

    public class ChatMessage
    {
        public string Role { get; set; } = string.Empty; // "user" or "assistant"
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Evidence { get; set; } // Supporting evidence for assistant responses
        public List<string>? Sources { get; set; } // Source references
    }

    public enum ChatRole
    {
        User,
        Assistant,
        System
    }
}
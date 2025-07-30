using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamLink.Api.Models
{
    public class CommunityPost
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string Content { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Category { get; set; } // 'Health', 'Parenting', 'Education', 'General'

        [StringLength(500)]
        public string? Tags { get; set; } // JSON array of tags

        [Column(TypeName = "nvarchar(max)")]
        public string? ImageUrls { get; set; } // JSON array of S3 URLs

        public int LikesCount { get; set; } = 0;

        public int CommentsCount { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<CommunityComment> Comments { get; set; } = new List<CommunityComment>();
        public virtual ICollection<CommunityLike> Likes { get; set; } = new List<CommunityLike>();

        [NotMapped]
        public List<string> TagsList
        {
            get
            {
                if (string.IsNullOrEmpty(Tags))
                    return new List<string>();
                
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<List<string>>(Tags) ?? new List<string>();
                }
                catch
                {
                    return new List<string>();
                }
            }
            set
            {
                Tags = System.Text.Json.JsonSerializer.Serialize(value);
            }
        }

        [NotMapped]
        public List<string> ImageUrlsList
        {
            get
            {
                if (string.IsNullOrEmpty(ImageUrls))
                    return new List<string>();
                
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<List<string>>(ImageUrls) ?? new List<string>();
                }
                catch
                {
                    return new List<string>();
                }
            }
            set
            {
                ImageUrls = System.Text.Json.JsonSerializer.Serialize(value);
            }
        }

        [NotMapped]
        public TimeSpan TimeAgo => DateTime.UtcNow - CreatedAt;

        [NotMapped]
        public bool IsLikedByCurrentUser { get; set; } // Set by service layer
    }

    public enum PostCategory
    {
        Health,
        Parenting,
        Education,
        Nutrition,
        Development,
        Safety,
        Activities,
        General,
        QnA,
        Support
    }
}
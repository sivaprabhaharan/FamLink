using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamLink.Api.Models
{
    public class CommunityComment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PostId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public Guid? ParentCommentId { get; set; } // For nested comments

        [Required]
        [StringLength(2000)]
        public string Content { get; set; } = string.Empty;

        public int LikesCount { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PostId")]
        public virtual CommunityPost Post { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("ParentCommentId")]
        public virtual CommunityComment? ParentComment { get; set; }

        public virtual ICollection<CommunityComment> Replies { get; set; } = new List<CommunityComment>();
        public virtual ICollection<CommunityLike> Likes { get; set; } = new List<CommunityLike>();

        [NotMapped]
        public TimeSpan TimeAgo => DateTime.UtcNow - CreatedAt;

        [NotMapped]
        public bool IsReply => ParentCommentId.HasValue;

        [NotMapped]
        public bool IsLikedByCurrentUser { get; set; } // Set by service layer

        [NotMapped]
        public int RepliesCount => Replies?.Count ?? 0;
    }
}
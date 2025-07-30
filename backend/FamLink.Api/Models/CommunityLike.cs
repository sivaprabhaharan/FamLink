using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamLink.Api.Models
{
    public class CommunityLike
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        public Guid? PostId { get; set; }

        public Guid? CommentId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("PostId")]
        public virtual CommunityPost? Post { get; set; }

        [ForeignKey("CommentId")]
        public virtual CommunityComment? Comment { get; set; }

        [NotMapped]
        public bool IsPostLike => PostId.HasValue && !CommentId.HasValue;

        [NotMapped]
        public bool IsCommentLike => CommentId.HasValue && !PostId.HasValue;
    }
}
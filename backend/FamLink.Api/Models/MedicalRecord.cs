using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamLink.Api.Models
{
    public class MedicalRecord
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ChildId { get; set; }

        [Required]
        [StringLength(50)]
        public string RecordType { get; set; } = string.Empty; // 'Vaccination', 'Checkup', 'Illness', 'Surgery', etc.

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [StringLength(200)]
        public string? DoctorName { get; set; }

        [StringLength(200)]
        public string? HospitalName { get; set; }

        [Required]
        public DateTime RecordDate { get; set; }

        [StringLength(1000)]
        public string? Medications { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? AttachmentUrls { get; set; } // JSON array of S3 URLs

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("ChildId")]
        public virtual Child Child { get; set; } = null!;

        [NotMapped]
        public List<string> AttachmentUrlsList
        {
            get
            {
                if (string.IsNullOrEmpty(AttachmentUrls))
                    return new List<string>();
                
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<List<string>>(AttachmentUrls) ?? new List<string>();
                }
                catch
                {
                    return new List<string>();
                }
            }
            set
            {
                AttachmentUrls = System.Text.Json.JsonSerializer.Serialize(value);
            }
        }
    }

    public enum MedicalRecordType
    {
        Vaccination,
        Checkup,
        Illness,
        Surgery,
        Allergy,
        Prescription,
        LabResult,
        Imaging,
        Emergency,
        Other
    }
}
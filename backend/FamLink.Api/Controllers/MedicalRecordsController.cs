using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamLink.Api.Data;
using FamLink.Api.Models;

namespace FamLink.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly FamLinkDbContext _context;
        private readonly ILogger<MedicalRecordsController> _logger;

        public MedicalRecordsController(FamLinkDbContext context, ILogger<MedicalRecordsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/medicalrecords/child/{childId}
        [HttpGet("child/{childId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetMedicalRecordsByChild(
            Guid childId,
            [FromQuery] string? recordType = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                // Verify child exists and user has access
                var child = await _context.Children
                    .Include(c => c.Parent)
                    .FirstOrDefaultAsync(c => c.Id == childId && c.IsActive);

                if (child == null)
                {
                    return NotFound("Child not found");
                }

                var query = _context.MedicalRecords
                    .Where(mr => mr.ChildId == childId && mr.IsActive);

                // Filter by record type
                if (!string.IsNullOrEmpty(recordType))
                {
                    query = query.Where(mr => mr.RecordType == recordType);
                }

                // Filter by date range
                if (fromDate.HasValue)
                {
                    query = query.Where(mr => mr.RecordDate >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(mr => mr.RecordDate <= toDate.Value);
                }

                // Pagination
                var totalCount = await query.CountAsync();
                var records = await query
                    .OrderByDescending(mr => mr.RecordDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(mr => new
                    {
                        mr.Id,
                        mr.RecordType,
                        mr.Title,
                        mr.Description,
                        mr.DoctorName,
                        mr.HospitalName,
                        mr.RecordDate,
                        mr.Medications,
                        mr.Notes,
                        mr.AttachmentUrlsList,
                        mr.CreatedAt,
                        mr.UpdatedAt,
                        Child = new
                        {
                            child.Id,
                            child.FirstName,
                            child.LastName,
                            child.AgeInYears,
                            child.AgeInMonths
                        }
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Records = records,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medical records for child {ChildId}", childId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/medicalrecords/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMedicalRecord(Guid id)
        {
            try
            {
                var record = await _context.MedicalRecords
                    .Include(mr => mr.Child)
                        .ThenInclude(c => c.Parent)
                    .FirstOrDefaultAsync(mr => mr.Id == id && mr.IsActive);

                if (record == null)
                {
                    return NotFound();
                }

                var recordResponse = new
                {
                    record.Id,
                    record.RecordType,
                    record.Title,
                    record.Description,
                    record.DoctorName,
                    record.HospitalName,
                    record.RecordDate,
                    record.Medications,
                    record.Notes,
                    record.AttachmentUrlsList,
                    record.CreatedAt,
                    record.UpdatedAt,
                    Child = new
                    {
                        record.Child.Id,
                        record.Child.FirstName,
                        record.Child.LastName,
                        record.Child.DateOfBirth,
                        record.Child.Gender,
                        record.Child.AgeInYears,
                        record.Child.AgeInMonths
                    }
                };

                return Ok(recordResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medical record {RecordId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/medicalrecords
        [HttpPost]
        public async Task<ActionResult<object>> CreateMedicalRecord(CreateMedicalRecordRequest request)
        {
            try
            {
                // Verify child exists
                var child = await _context.Children
                    .FirstOrDefaultAsync(c => c.Id == request.ChildId && c.IsActive);

                if (child == null)
                {
                    return BadRequest("Invalid child");
                }

                var record = new MedicalRecord
                {
                    ChildId = request.ChildId,
                    RecordType = request.RecordType,
                    Title = request.Title,
                    Description = request.Description,
                    DoctorName = request.DoctorName,
                    HospitalName = request.HospitalName,
                    RecordDate = request.RecordDate,
                    Medications = request.Medications,
                    Notes = request.Notes,
                    AttachmentUrlsList = request.AttachmentUrls ?? new List<string>()
                };

                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                // Load the record with child information
                var createdRecord = await _context.MedicalRecords
                    .Include(mr => mr.Child)
                    .FirstAsync(mr => mr.Id == record.Id);

                return CreatedAtAction(nameof(GetMedicalRecord), new { id = record.Id }, new
                {
                    createdRecord.Id,
                    createdRecord.RecordType,
                    createdRecord.Title,
                    createdRecord.Description,
                    createdRecord.DoctorName,
                    createdRecord.HospitalName,
                    createdRecord.RecordDate,
                    createdRecord.Medications,
                    createdRecord.Notes,
                    createdRecord.AttachmentUrlsList,
                    createdRecord.CreatedAt,
                    createdRecord.UpdatedAt,
                    Child = new
                    {
                        createdRecord.Child.Id,
                        createdRecord.Child.FirstName,
                        createdRecord.Child.LastName,
                        createdRecord.Child.AgeInYears,
                        createdRecord.Child.AgeInMonths
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/medicalrecords/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateMedicalRecord(Guid id, UpdateMedicalRecordRequest request)
        {
            try
            {
                var record = await _context.MedicalRecords
                    .Include(mr => mr.Child)
                    .FirstOrDefaultAsync(mr => mr.Id == id && mr.IsActive);

                if (record == null)
                {
                    return NotFound();
                }

                // Update record properties
                record.RecordType = request.RecordType ?? record.RecordType;
                record.Title = request.Title ?? record.Title;
                record.Description = request.Description ?? record.Description;
                record.DoctorName = request.DoctorName ?? record.DoctorName;
                record.HospitalName = request.HospitalName ?? record.HospitalName;
                record.RecordDate = request.RecordDate ?? record.RecordDate;
                record.Medications = request.Medications ?? record.Medications;
                record.Notes = request.Notes ?? record.Notes;

                if (request.AttachmentUrls != null)
                {
                    record.AttachmentUrlsList = request.AttachmentUrls;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    record.Id,
                    record.RecordType,
                    record.Title,
                    record.Description,
                    record.DoctorName,
                    record.HospitalName,
                    record.RecordDate,
                    record.Medications,
                    record.Notes,
                    record.AttachmentUrlsList,
                    record.CreatedAt,
                    record.UpdatedAt,
                    Child = new
                    {
                        record.Child.Id,
                        record.Child.FirstName,
                        record.Child.LastName,
                        record.Child.AgeInYears,
                        record.Child.AgeInMonths
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating medical record {RecordId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/medicalrecords/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicalRecord(Guid id)
        {
            try
            {
                var record = await _context.MedicalRecords.FindAsync(id);

                if (record == null)
                {
                    return NotFound();
                }

                // Soft delete
                record.IsActive = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting medical record {RecordId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/medicalrecords/types
        [HttpGet("types")]
        public ActionResult<IEnumerable<string>> GetRecordTypes()
        {
            var recordTypes = Enum.GetNames(typeof(MedicalRecordType)).ToList();
            return Ok(recordTypes);
        }

        // GET: api/medicalrecords/child/{childId}/summary
        [HttpGet("child/{childId}/summary")]
        public async Task<ActionResult<object>> GetMedicalSummary(Guid childId)
        {
            try
            {
                var child = await _context.Children
                    .FirstOrDefaultAsync(c => c.Id == childId && c.IsActive);

                if (child == null)
                {
                    return NotFound("Child not found");
                }

                var records = await _context.MedicalRecords
                    .Where(mr => mr.ChildId == childId && mr.IsActive)
                    .ToListAsync();

                var summary = new
                {
                    TotalRecords = records.Count,
                    RecordsByType = records
                        .GroupBy(r => r.RecordType)
                        .Select(g => new { Type = g.Key, Count = g.Count() })
                        .OrderByDescending(x => x.Count),
                    RecentRecords = records
                        .OrderByDescending(r => r.RecordDate)
                        .Take(5)
                        .Select(r => new
                        {
                            r.Id,
                            r.RecordType,
                            r.Title,
                            r.RecordDate,
                            r.DoctorName,
                            r.HospitalName
                        }),
                    LastVaccination = records
                        .Where(r => r.RecordType == "Vaccination")
                        .OrderByDescending(r => r.RecordDate)
                        .Select(r => new { r.Title, r.RecordDate })
                        .FirstOrDefault(),
                    LastCheckup = records
                        .Where(r => r.RecordType == "Checkup")
                        .OrderByDescending(r => r.RecordDate)
                        .Select(r => new { r.Title, r.RecordDate, r.DoctorName })
                        .FirstOrDefault()
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medical summary for child {ChildId}", childId);
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // DTOs for requests
    public class CreateMedicalRecordRequest
    {
        public Guid ChildId { get; set; }
        public string RecordType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? DoctorName { get; set; }
        public string? HospitalName { get; set; }
        public DateTime RecordDate { get; set; }
        public string? Medications { get; set; }
        public string? Notes { get; set; }
        public List<string>? AttachmentUrls { get; set; }
    }

    public class UpdateMedicalRecordRequest
    {
        public string? RecordType { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? DoctorName { get; set; }
        public string? HospitalName { get; set; }
        public DateTime? RecordDate { get; set; }
        public string? Medications { get; set; }
        public string? Notes { get; set; }
        public List<string>? AttachmentUrls { get; set; }
    }
}
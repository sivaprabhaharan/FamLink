using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamLink.Api.Data;
using FamLink.Api.Models;

namespace FamLink.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly FamLinkDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(FamLinkDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.IsActive)
                    .Select(u => new
                    {
                        u.Id,
                        u.Email,
                        u.FirstName,
                        u.LastName,
                        u.ProfilePictureUrl,
                        u.City,
                        u.State,
                        u.Country,
                        u.CreatedAt,
                        ChildrenCount = u.Children.Count(c => c.IsActive)
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Children.Where(c => c.IsActive))
                    .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);

                if (user == null)
                {
                    return NotFound();
                }

                // Remove sensitive information
                var userResponse = new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.ProfilePictureUrl,
                    user.DateOfBirth,
                    user.Gender,
                    user.Address,
                    user.City,
                    user.State,
                    user.ZipCode,
                    user.Country,
                    user.CreatedAt,
                    user.UpdatedAt,
                    Children = user.Children.Select(c => new
                    {
                        c.Id,
                        c.FirstName,
                        c.LastName,
                        c.DateOfBirth,
                        c.Gender,
                        c.ProfilePictureUrl,
                        c.AgeInYears,
                        c.AgeInMonths
                    })
                };

                return Ok(userResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/users/cognito/{cognitoUserId}
        [HttpGet("cognito/{cognitoUserId}")]
        public async Task<ActionResult<User>> GetUserByCognitoId(string cognitoUserId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Children.Where(c => c.IsActive))
                    .FirstOrDefaultAsync(u => u.CognitoUserId == cognitoUserId && u.IsActive);

                if (user == null)
                {
                    return NotFound();
                }

                var userResponse = new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.ProfilePictureUrl,
                    user.DateOfBirth,
                    user.Gender,
                    user.Address,
                    user.City,
                    user.State,
                    user.ZipCode,
                    user.Country,
                    user.CreatedAt,
                    user.UpdatedAt,
                    Children = user.Children.Select(c => new
                    {
                        c.Id,
                        c.FirstName,
                        c.LastName,
                        c.DateOfBirth,
                        c.Gender,
                        c.ProfilePictureUrl,
                        c.AgeInYears,
                        c.AgeInMonths
                    })
                };

                return Ok(userResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by Cognito ID {CognitoUserId}", cognitoUserId);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(CreateUserRequest request)
        {
            try
            {
                // Check if user with this Cognito ID already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.CognitoUserId == request.CognitoUserId);

                if (existingUser != null)
                {
                    return Conflict("User with this Cognito ID already exists");
                }

                // Check if email already exists
                var existingEmail = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (existingEmail != null)
                {
                    return Conflict("User with this email already exists");
                }

                var user = new User
                {
                    CognitoUserId = request.CognitoUserId,
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    PhoneNumber = request.PhoneNumber,
                    DateOfBirth = request.DateOfBirth,
                    Gender = request.Gender,
                    Address = request.Address,
                    City = request.City,
                    State = request.State,
                    ZipCode = request.ZipCode,
                    Country = request.Country ?? "India"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.ProfilePictureUrl,
                    user.DateOfBirth,
                    user.Gender,
                    user.Address,
                    user.City,
                    user.State,
                    user.ZipCode,
                    user.Country,
                    user.CreatedAt,
                    user.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, UpdateUserRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null || !user.IsActive)
                {
                    return NotFound();
                }

                // Update user properties
                user.FirstName = request.FirstName ?? user.FirstName;
                user.LastName = request.LastName ?? user.LastName;
                user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
                user.ProfilePictureUrl = request.ProfilePictureUrl ?? user.ProfilePictureUrl;
                user.DateOfBirth = request.DateOfBirth ?? user.DateOfBirth;
                user.Gender = request.Gender ?? user.Gender;
                user.Address = request.Address ?? user.Address;
                user.City = request.City ?? user.City;
                user.State = request.State ?? user.State;
                user.ZipCode = request.ZipCode ?? user.ZipCode;
                user.Country = request.Country ?? user.Country;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.ProfilePictureUrl,
                    user.DateOfBirth,
                    user.Gender,
                    user.Address,
                    user.City,
                    user.State,
                    user.ZipCode,
                    user.Country,
                    user.CreatedAt,
                    user.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                {
                    return NotFound();
                }

                // Soft delete
                user.IsActive = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // DTOs for requests
    public class CreateUserRequest
    {
        public string CognitoUserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }
}
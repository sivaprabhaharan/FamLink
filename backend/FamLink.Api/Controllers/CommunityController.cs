using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamLink.Api.Data;
using FamLink.Api.Models;

namespace FamLink.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommunityController : ControllerBase
    {
        private readonly FamLinkDbContext _context;
        private readonly ILogger<CommunityController> _logger;

        public CommunityController(FamLinkDbContext context, ILogger<CommunityController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/community/posts
        [HttpGet("posts")]
        public async Task<ActionResult<IEnumerable<object>>> GetPosts(
            [FromQuery] string? category = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            try
            {
                var query = _context.CommunityPosts
                    .Include(p => p.User)
                    .Where(p => p.IsActive);

                // Filter by category
                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(p => p.Category == category);
                }

                // Search functionality
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p => p.Title.Contains(search) || p.Content.Contains(search));
                }

                // Pagination
                var totalCount = await query.CountAsync();
                var posts = await query
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new
                    {
                        p.Id,
                        p.Title,
                        p.Content,
                        p.Category,
                        p.TagsList,
                        p.ImageUrlsList,
                        p.LikesCount,
                        p.CommentsCount,
                        p.CreatedAt,
                        p.UpdatedAt,
                        Author = new
                        {
                            p.User.Id,
                            p.User.FirstName,
                            p.User.LastName,
                            p.User.ProfilePictureUrl
                        }
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Posts = posts,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving community posts");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/community/posts/{id}
        [HttpGet("posts/{id}")]
        public async Task<ActionResult<object>> GetPost(Guid id)
        {
            try
            {
                var post = await _context.CommunityPosts
                    .Include(p => p.User)
                    .Include(p => p.Comments.Where(c => c.IsActive))
                        .ThenInclude(c => c.User)
                    .Include(p => p.Comments.Where(c => c.IsActive))
                        .ThenInclude(c => c.Replies.Where(r => r.IsActive))
                            .ThenInclude(r => r.User)
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

                if (post == null)
                {
                    return NotFound();
                }

                var postResponse = new
                {
                    post.Id,
                    post.Title,
                    post.Content,
                    post.Category,
                    post.TagsList,
                    post.ImageUrlsList,
                    post.LikesCount,
                    post.CommentsCount,
                    post.CreatedAt,
                    post.UpdatedAt,
                    Author = new
                    {
                        post.User.Id,
                        post.User.FirstName,
                        post.User.LastName,
                        post.User.ProfilePictureUrl
                    },
                    Comments = post.Comments
                        .Where(c => c.ParentCommentId == null)
                        .OrderBy(c => c.CreatedAt)
                        .Select(c => new
                        {
                            c.Id,
                            c.Content,
                            c.LikesCount,
                            c.CreatedAt,
                            Author = new
                            {
                                c.User.Id,
                                c.User.FirstName,
                                c.User.LastName,
                                c.User.ProfilePictureUrl
                            },
                            Replies = c.Replies.OrderBy(r => r.CreatedAt).Select(r => new
                            {
                                r.Id,
                                r.Content,
                                r.LikesCount,
                                r.CreatedAt,
                                Author = new
                                {
                                    r.User.Id,
                                    r.User.FirstName,
                                    r.User.LastName,
                                    r.User.ProfilePictureUrl
                                }
                            })
                        })
                };

                return Ok(postResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving community post {PostId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/community/posts
        [HttpPost("posts")]
        public async Task<ActionResult<object>> CreatePost(CreatePostRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null || !user.IsActive)
                {
                    return BadRequest("Invalid user");
                }

                var post = new CommunityPost
                {
                    UserId = request.UserId,
                    Title = request.Title,
                    Content = request.Content,
                    Category = request.Category,
                    TagsList = request.Tags ?? new List<string>(),
                    ImageUrlsList = request.ImageUrls ?? new List<string>()
                };

                _context.CommunityPosts.Add(post);
                await _context.SaveChangesAsync();

                // Load the post with user information
                var createdPost = await _context.CommunityPosts
                    .Include(p => p.User)
                    .FirstAsync(p => p.Id == post.Id);

                return CreatedAtAction(nameof(GetPost), new { id = post.Id }, new
                {
                    createdPost.Id,
                    createdPost.Title,
                    createdPost.Content,
                    createdPost.Category,
                    createdPost.TagsList,
                    createdPost.ImageUrlsList,
                    createdPost.LikesCount,
                    createdPost.CommentsCount,
                    createdPost.CreatedAt,
                    createdPost.UpdatedAt,
                    Author = new
                    {
                        createdPost.User.Id,
                        createdPost.User.FirstName,
                        createdPost.User.LastName,
                        createdPost.User.ProfilePictureUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating community post");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/community/posts/{postId}/comments
        [HttpPost("posts/{postId}/comments")]
        public async Task<ActionResult<object>> CreateComment(Guid postId, CreateCommentRequest request)
        {
            try
            {
                var post = await _context.CommunityPosts.FindAsync(postId);
                if (post == null || !post.IsActive)
                {
                    return NotFound("Post not found");
                }

                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null || !user.IsActive)
                {
                    return BadRequest("Invalid user");
                }

                var comment = new CommunityComment
                {
                    PostId = postId,
                    UserId = request.UserId,
                    ParentCommentId = request.ParentCommentId,
                    Content = request.Content
                };

                _context.CommunityComments.Add(comment);

                // Update post comment count
                post.CommentsCount++;

                await _context.SaveChangesAsync();

                // Load the comment with user information
                var createdComment = await _context.CommunityComments
                    .Include(c => c.User)
                    .FirstAsync(c => c.Id == comment.Id);

                return CreatedAtAction(nameof(GetPost), new { id = postId }, new
                {
                    createdComment.Id,
                    createdComment.Content,
                    createdComment.LikesCount,
                    createdComment.CreatedAt,
                    createdComment.ParentCommentId,
                    Author = new
                    {
                        createdComment.User.Id,
                        createdComment.User.FirstName,
                        createdComment.User.LastName,
                        createdComment.User.ProfilePictureUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment for post {PostId}", postId);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/community/posts/{postId}/like
        [HttpPost("posts/{postId}/like")]
        public async Task<ActionResult<object>> LikePost(Guid postId, LikeRequest request)
        {
            try
            {
                var post = await _context.CommunityPosts.FindAsync(postId);
                if (post == null || !post.IsActive)
                {
                    return NotFound("Post not found");
                }

                var existingLike = await _context.CommunityLikes
                    .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == request.UserId);

                if (existingLike != null)
                {
                    // Unlike
                    _context.CommunityLikes.Remove(existingLike);
                    post.LikesCount = Math.Max(0, post.LikesCount - 1);
                    await _context.SaveChangesAsync();
                    
                    return Ok(new { Liked = false, LikesCount = post.LikesCount });
                }
                else
                {
                    // Like
                    var like = new CommunityLike
                    {
                        PostId = postId,
                        UserId = request.UserId
                    };

                    _context.CommunityLikes.Add(like);
                    post.LikesCount++;
                    await _context.SaveChangesAsync();
                    
                    return Ok(new { Liked = true, LikesCount = post.LikesCount });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error liking/unliking post {PostId}", postId);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/community/comments/{commentId}/like
        [HttpPost("comments/{commentId}/like")]
        public async Task<ActionResult<object>> LikeComment(Guid commentId, LikeRequest request)
        {
            try
            {
                var comment = await _context.CommunityComments.FindAsync(commentId);
                if (comment == null || !comment.IsActive)
                {
                    return NotFound("Comment not found");
                }

                var existingLike = await _context.CommunityLikes
                    .FirstOrDefaultAsync(l => l.CommentId == commentId && l.UserId == request.UserId);

                if (existingLike != null)
                {
                    // Unlike
                    _context.CommunityLikes.Remove(existingLike);
                    comment.LikesCount = Math.Max(0, comment.LikesCount - 1);
                    await _context.SaveChangesAsync();
                    
                    return Ok(new { Liked = false, LikesCount = comment.LikesCount });
                }
                else
                {
                    // Like
                    var like = new CommunityLike
                    {
                        CommentId = commentId,
                        UserId = request.UserId
                    };

                    _context.CommunityLikes.Add(like);
                    comment.LikesCount++;
                    await _context.SaveChangesAsync();
                    
                    return Ok(new { Liked = true, LikesCount = comment.LikesCount });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error liking/unliking comment {CommentId}", commentId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/community/categories
        [HttpGet("categories")]
        public ActionResult<IEnumerable<string>> GetCategories()
        {
            var categories = Enum.GetNames(typeof(PostCategory)).ToList();
            return Ok(categories);
        }
    }

    // DTOs for requests
    public class CreatePostRequest
    {
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Category { get; set; }
        public List<string>? Tags { get; set; }
        public List<string>? ImageUrls { get; set; }
    }

    public class CreateCommentRequest
    {
        public Guid UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public Guid? ParentCommentId { get; set; }
    }

    public class LikeRequest
    {
        public Guid UserId { get; set; }
    }
}
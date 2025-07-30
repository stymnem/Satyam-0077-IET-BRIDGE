using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

[Index("Email", Name = "UQ__Alumni__A9D10534DC0DE5A8", IsUnique = true)]
public partial class Alumnus
{
    [Key]
    [Column("AlumniID")]
    public int AlumniId { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(100)]
    public string Email { get; set; } = null!;

    public string? PasswordHash { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    public string? ProfilePic { get; set; }

    [InverseProperty("Alumni")]
    public virtual ICollection<Education> Educations { get; set; } = new List<Education>();

    [InverseProperty("Alumni")]
    public virtual ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();

    [InverseProperty("Alumni")]
    public virtual ICollection<Professional> Professionals { get; set; } = new List<Professional>();

    [InverseProperty("Alumni")]
    public virtual ICollection<Rsvp> Rsvps { get; set; } = new List<Rsvp>();
}

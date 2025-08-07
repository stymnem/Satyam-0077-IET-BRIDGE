using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

[Table("JobPost")]
public partial class JobPost
{
    [Key]
    [Column("JobID")]
    public int JobId { get; set; }

    [Column("AlumniID")]
    public int? AlumniId { get; set; }

    [StringLength(100)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [StringLength(100)]
    public string? Location { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PostedOn { get; set; }

    [ForeignKey("AlumniId")]
    [InverseProperty("JobPosts")]
    public virtual Alumnus? Alumni { get; set; }
}

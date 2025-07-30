using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

[Table("RSVP")]
public partial class Rsvp
{
    [Key]
    [Column("RSVPID")]
    public int Rsvpid { get; set; }

    [Column("EventID")]
    public int? EventId { get; set; }

    [Column("AlumniID")]
    public int? AlumniId { get; set; }

    [ForeignKey("AlumniId")]
    [InverseProperty("Rsvps")]
    public virtual Alumnus? Alumni { get; set; }

    [ForeignKey("EventId")]
    [InverseProperty("Rsvps")]
    public virtual Event? Event { get; set; }
}

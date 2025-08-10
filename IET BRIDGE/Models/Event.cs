using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

[Table("Event")]
public partial class Event
{
    [Key]
    [Column("EventID")]
    public int EventId { get; set; }

    [StringLength(100)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateOnly? EventDate { get; set; }

    [InverseProperty("Event")]
    public virtual ICollection<Rsvp> Rsvps { get; set; } = new List<Rsvp>();
}

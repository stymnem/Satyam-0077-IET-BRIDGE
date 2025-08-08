import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Edit, Trash2, Calendar, MapPin, Building } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import api from '@/api/axios';
import { ProfessionalExperience, ProfessionalExperienceDto } from '@/types';

const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  isCurrentJob: z.boolean().default(false),
});

type ExperienceForm = z.infer<typeof experienceSchema>;

export default function ProfessionalExperiencePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const queryClient = useQueryClient();

  const { data: experiences, isLoading } = useQuery({
    queryKey: ['professional-experience'],
    queryFn: async () => {
      const response = await api.get('/professional-experience');
      return response.data as ProfessionalExperience[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProfessionalExperienceDto) => {
      const response = await api.post('/professional-experience', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-experience'] });
      toast.success('Experience record created successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to create experience record');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProfessionalExperienceDto }) => {
      const response = await api.put(`/professional-experience/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-experience'] });
      toast.success('Experience record updated successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to update experience record');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/professional-experience/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-experience'] });
      toast.success('Experience record deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete experience record');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
  });

  const watchIsCurrentJob = watch('isCurrentJob');

  const onSubmit = (data: ExperienceForm) => {
    const experienceData: ProfessionalExperienceDto = {
      company: data.company,
      position: data.position,
      location: data.location || undefined,
      startDate: data.startDate,
      endDate: data.isCurrentJob ? undefined : data.endDate,
      description: data.description || undefined,
      isCurrentJob: data.isCurrentJob,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: experienceData });
    } else {
      createMutation.mutate(experienceData);
    }
  };

  const handleEdit = (experience: ProfessionalExperience) => {
    setEditingId(experience.id);
    setIsCurrentJob(experience.isCurrentJob);
    setValue('company', experience.company);
    setValue('position', experience.position);
    setValue('location', experience.location || '');
    setValue('startDate', experience.startDate.split('T')[0]);
    setValue('endDate', experience.endDate ? experience.endDate.split('T')[0] : '');
    setValue('description', experience.description || '');
    setValue('isCurrentJob', experience.isCurrentJob);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this experience record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setIsCurrentJob(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading professional experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Professional Experience</h1>
          <p className="text-muted-foreground">
            Manage your career history and work experience
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Experience' : 'Add Experience'}
              </DialogTitle>
              <DialogDescription>
                {editingId 
                  ? 'Update your professional experience details'
                  : 'Add a new position to your career history'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Company name"
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    {...register('position')}
                    placeholder="Job title"
                  />
                  {errors.position && (
                    <p className="text-sm text-destructive">{errors.position.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="City, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCurrentJob"
                  {...register('isCurrentJob')}
                  onChange={(e) => {
                    setIsCurrentJob(e.target.checked);
                    setValue('isCurrentJob', e.target.checked);
                  }}
                  className="rounded"
                />
                <Label htmlFor="isCurrentJob">I currently work here</Label>
              </div>

              {!watchIsCurrentJob && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register('endDate')}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your role and achievements..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingId 
                      ? 'Update Experience' 
                      : 'Add Experience'
                  }
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experience Records */}
      <div className="grid gap-4">
        {experiences && experiences.length > 0 ? (
          experiences
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((experience) => (
              <Card key={experience.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        {experience.position}
                      </CardTitle>
                      <CardDescription className="text-base mt-1 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {experience.company}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {experience.isCurrentJob && (
                        <Badge variant="default">Current</Badge>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEdit(experience)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(experience.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(experience.startDate)} - {
                        experience.isCurrentJob ? 'Present' : 
                        experience.endDate ? formatDate(experience.endDate) : 'Present'
                      }
                    </div>
                    {experience.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {experience.location}
                      </div>
                    )}
                  </div>
                  {experience.description && (
                    <p className="text-sm text-muted-foreground">{experience.description}</p>
                  )}
                </CardContent>
              </Card>
            ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No professional experience</h3>
              <p className="text-muted-foreground mb-4">
                Start building your professional profile by adding your work experience.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Work Experience
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
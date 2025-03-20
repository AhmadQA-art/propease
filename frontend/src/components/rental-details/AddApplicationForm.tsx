import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { applicationService, RentalApplication } from '../../services/application.service';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Loader2 } from 'lucide-react';

// Define the form schema
const applicationSchema = z.object({
  // Applicant Information
  id_type: z.enum(['passport', 'qid', 'driving_license']),
  id_number: z.string().min(1, 'ID number is required'),
  id_expiry_date: z.string().min(1, 'ID expiry date is required'),
  
  // Property & Unit Details
  property_id: z.string().min(1, 'Property is required'),
  unit_id: z.string().min(1, 'Unit is required'),
  desired_move_in_date: z.string().min(1, 'Move-in date is required'),
  lease_term: z.number().min(1, 'Lease term is required'),
  
  // Lease & Financial Details
  monthly_income: z.number().min(1, 'Monthly income is required'),
  has_pets: z.boolean(),
  has_vehicles: z.boolean(),
  is_employed: z.boolean(),
  
  // Background Checks & Emergency Contact
  background_check_status: z.enum(['pending', 'passed', 'failed']),
  credit_check_status: z.enum(['pending', 'approved', 'rejected']),
  emergency_contact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().min(1, 'Emergency contact phone is required'),
    relationship: z.string().min(1, 'Emergency contact relationship is required'),
  }),
  
  // Additional Details
  notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface AddApplicationFormProps {
  propertyId: string;
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddApplicationForm({ propertyId, organizationId, onSuccess, onCancel }: AddApplicationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      has_pets: false,
      has_vehicles: false,
      is_employed: true,
      background_check_status: 'pending',
      credit_check_status: 'pending',
      lease_term: 12,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);

      // Create the application
      const application = await applicationService.createApplication({
        ...data,
        property_id: propertyId,
        organization_id: organizationId,
      });

      // Upload documents if any
      if (documents.length > 0) {
        await Promise.all(
          documents.map((file) =>
            applicationService.uploadApplicationDocument(
              application.id!,
              file,
              file.type,
              organizationId
            )
          )
        );
      }

      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Applicant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_type">ID Type</Label>
              <Select
                onValueChange={(value) => setValue('id_type', value as 'passport' | 'qid' | 'driving_license')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="qid">QID</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                </SelectContent>
              </Select>
              {errors.id_type && (
                <p className="text-sm text-red-500">{errors.id_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                {...register('id_number')}
                placeholder="Enter ID number"
              />
              {errors.id_number && (
                <p className="text-sm text-red-500">{errors.id_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_expiry_date">ID Expiry Date</Label>
              <Input
                id="id_expiry_date"
                type="date"
                {...register('id_expiry_date')}
              />
              {errors.id_expiry_date && (
                <p className="text-sm text-red-500">{errors.id_expiry_date.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property & Unit Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property & Unit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desired_move_in_date">Desired Move-in Date</Label>
              <Input
                id="desired_move_in_date"
                type="date"
                {...register('desired_move_in_date')}
              />
              {errors.desired_move_in_date && (
                <p className="text-sm text-red-500">{errors.desired_move_in_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lease_term">Lease Term (months)</Label>
              <Input
                id="lease_term"
                type="number"
                {...register('lease_term', { valueAsNumber: true })}
                min="1"
                max="24"
              />
              {errors.lease_term && (
                <p className="text-sm text-red-500">{errors.lease_term.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease & Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Lease & Financial Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_income">Monthly Income</Label>
              <Input
                id="monthly_income"
                type="number"
                {...register('monthly_income', { valueAsNumber: true })}
                min="0"
                step="100"
              />
              {errors.monthly_income && (
                <p className="text-sm text-red-500">{errors.monthly_income.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_pets"
                  {...register('has_pets')}
                />
                <Label htmlFor="has_pets">Has Pets</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_vehicles"
                  {...register('has_vehicles')}
                />
                <Label htmlFor="has_vehicles">Has Vehicles</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_employed"
                  {...register('is_employed')}
                />
                <Label htmlFor="is_employed">Is Employed</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Checks & Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Background Checks & Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="background_check_status">Background Check Status</Label>
              <Select
                onValueChange={(value) => setValue('background_check_status', value as 'pending' | 'passed' | 'failed')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              {errors.background_check_status && (
                <p className="text-sm text-red-500">{errors.background_check_status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_check_status">Credit Check Status</Label>
              <Select
                onValueChange={(value) => setValue('credit_check_status', value as 'pending' | 'approved' | 'rejected')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {errors.credit_check_status && (
                <p className="text-sm text-red-500">{errors.credit_check_status.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact.name">Name</Label>
                <Input
                  id="emergency_contact.name"
                  {...register('emergency_contact.name')}
                />
                {errors.emergency_contact?.name && (
                  <p className="text-sm text-red-500">{errors.emergency_contact.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact.phone">Phone</Label>
                <Input
                  id="emergency_contact.phone"
                  {...register('emergency_contact.phone')}
                />
                {errors.emergency_contact?.phone && (
                  <p className="text-sm text-red-500">{errors.emergency_contact.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact.relationship">Relationship</Label>
                <Input
                  id="emergency_contact.relationship"
                  {...register('emergency_contact.relationship')}
                />
                {errors.emergency_contact?.relationship && (
                  <p className="text-sm text-red-500">{errors.emergency_contact.relationship.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Add any additional notes..."
              rows={4}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">Required Documents</Label>
            <Input
              id="documents"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">
              Upload any required documents (ID, proof of income, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Application
        </Button>
      </div>
    </form>
  );
} 
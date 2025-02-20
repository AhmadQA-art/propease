import { RentalDetails } from '../types/rental';

export const dummyRentals: RentalDetails[] = [
    {
        id: '1',
        name: 'Sunset Gardens',
        address: '123 Sunset Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        type: 'residential',
        unit: 3,
        total_units: 50,
        owner_id: 'owner1',
        organization_id: 'org1',
        status: 'active',
        owner: {
            id: 'owner1',
            user: {
                id: 'user1',
                first_name: 'Sarah',
                last_name: 'Wilson',
                email: 'sarah@example.com'
            }
        },
        resident: {
            id: 'resident1',
            name: 'John Doe',
            email: 'john@example.com'
        }
    },
    {
        id: '2',
        name: 'Downtown Business Center',
        address: '100 Financial District',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94111',
        type: 'commercial',
        unit: 12,
        total_units: 20,
        owner_id: 'owner2',
        organization_id: 'org1',
        status: 'active',
        owner: {
            id: 'owner2',
            user: {
                id: 'user2',
                first_name: 'Robert',
                last_name: 'Brown',
                email: 'robert@example.com'
            }
        },
        resident: {
            id: 'resident2',
            name: 'Tech Solutions Inc.',
            email: 'contact@techsolutions.com'
        }
    },
    {
        id: '3',
        propertyId: 'p3',
        propertyName: 'Harbor View Apartments',
        address: '456 Ocean Drive, Miami Beach, FL',
        unit: '5',
        type: 'residential',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        rentAmount: 2000,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r3',
            name: 'Emily Johnson',
            email: 'emily@example.com',
            phone: '555-123-4567'
        },
        owner: 'David Lee',
        manager: 'Amanda Garcia',
        status: 'active',
        agreementFile: 'rental-agreement-003.pdf'
    },
    {
        id: '4',
        propertyId: 'p4',
        propertyName: 'Innovation Hub',
        address: '123 Innovation Drive, Austin, TX',
        unit: '8',
        type: 'commercial',
        startDate: '2024-01-15',
        endDate: '2026-01-14',
        rentAmount: 7500,
        paymentFrequency: 'quarterly',
        resident: {
            id: 'r4',
            name: 'Digital Dynamics LLC',
            email: 'info@digitaldynamics.com',
            phone: '888-999-0000'
        },
        owner: 'Jennifer Lee',
        manager: 'Alex Rodriguez',
        status: 'active',
        agreementFile: 'rental-agreement-004.pdf'
    },
    {
        id: '5',
        propertyId: 'p5',
        propertyName: 'Green Valley Residences',
        address: '789 Green Valley Drive, Denver, CO',
        unit: '2',
        type: 'residential',
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        rentAmount: 1800,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r5',
            name: 'Michael Brown',
            email: 'michael@example.com',
            phone: '777-888-9999'
        },
        owner: 'Patricia Wang',
        manager: 'James Wilson',
        status: 'pending',
        agreementFile: null
    },
    {
        id: '6',
        propertyId: 'p6',
        propertyName: 'Retail Plaza',
        address: '901 Retail Drive, Chicago, IL',
        unit: '15',
        type: 'commercial',
        startDate: '2024-02-01',
        endDate: '2029-01-31',
        rentAmount: 4500,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r6',
            name: 'Fashion Forward Co.',
            email: 'contact@fashionforward.com',
            phone: '444-555-6666'
        },
        owner: 'Thomas Anderson',
        manager: 'Maria Garcia',
        status: 'active',
        agreementFile: 'rental-agreement-006.pdf'
    }
];

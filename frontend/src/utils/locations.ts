export const locations: Record<string, string> = {
  'Sunset Gardens': '123 Sunset Blvd, Los Angeles, CA',
  'Downtown Business Center': '456 Main St, New York, NY',
  'Harbor View Apartments': '456 Ocean Drive, Miami Beach, FL',
  'Innovation Hub': '789 Tech Park Way, Austin, TX',
  'Green Valley Residences': '321 Mountain View Rd, Denver, CO',
  'Retail Plaza': '567 Shopping Avenue, Chicago, IL'
};

export const getPropertyLocation = (propertyName: string | undefined): string => {
  if (!propertyName) return '123 Example St, City, State';
  return locations[propertyName] || '123 Example St, City, State';
}; 
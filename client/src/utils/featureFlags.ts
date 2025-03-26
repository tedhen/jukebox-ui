interface FeatureFlags {
  searchAsDefault: boolean;
  // Add more feature flags here as needed
}

// Get a boolean value from runtime config
const getRuntimeBoolean = (key: string, defaultValue: boolean): boolean => {
  const config = (window as any).JUKEBOX_CONFIG || {};
  const value = config[key];
  if (value === undefined) return defaultValue;
  return value === true || value === 'true' || value === '1';
};

export const featureFlags: FeatureFlags = {
  searchAsDefault: getRuntimeBoolean('FEATURE_SEARCH_AS_DEFAULT', false),
};

// Add a refresh method for when configuration changes
export const refreshFeatureFlags = () => {
  featureFlags.searchAsDefault = getRuntimeBoolean('FEATURE_SEARCH_AS_DEFAULT', false);
  return featureFlags;
};

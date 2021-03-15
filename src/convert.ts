/**
 * Converts a regular date string to a Jira compliant worlog string
 * @param dateString string representing a regular Date
 * @returns {!string} 
 */
export const dateStringToWorklogString = (dateString: string): string => {
    return dateString + 'aaaaaaaaaaaaaaaaaaaaaaaa';
}
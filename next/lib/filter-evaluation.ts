/**
 * Reusable filter evaluation for schedule queries
 */

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in';

export interface ScheduleFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface ScheduleQuery {
  filters: ScheduleFilter[];
  logic: 'AND' | 'OR';
}

/**
 * Evaluate a single filter against a record
 */
export function evaluateFilter(recordData: any, filter: ScheduleFilter): boolean {
  const actualValue = recordData[filter.field];
  const expectedValue = filter.value;

  switch (filter.operator) {
    case 'equals':
      return actualValue === expectedValue || String(actualValue) === String(expectedValue);

    case 'not_equals':
      return actualValue !== expectedValue && String(actualValue) !== String(expectedValue);

    case 'contains':
      return String(actualValue || '').toLowerCase().includes(String(expectedValue).toLowerCase());

    case 'not_contains':
      return !String(actualValue || '').toLowerCase().includes(String(expectedValue).toLowerCase());

    case 'is_empty':
      return actualValue === null || actualValue === '' || actualValue === undefined;

    case 'is_not_empty':
      return actualValue !== null && actualValue !== '' && actualValue !== undefined;

    case 'greater_than':
      return Number(actualValue) > Number(expectedValue);

    case 'less_than':
      return Number(actualValue) < Number(expectedValue);

    case 'greater_or_equal':
      return Number(actualValue) >= Number(expectedValue);

    case 'less_or_equal':
      return Number(actualValue) <= Number(expectedValue);

    case 'starts_with':
      return String(actualValue || '').toLowerCase().startsWith(String(expectedValue).toLowerCase());

    case 'ends_with':
      return String(actualValue || '').toLowerCase().endsWith(String(expectedValue).toLowerCase());

    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue);

    case 'not_in':
      return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);

    default:
      console.warn(`Unknown filter operator: ${filter.operator}`);
      return false;
  }
}

/**
 * Evaluate a schedule query against a record
 */
export function evaluateQuery(recordData: any, query: ScheduleQuery): boolean {
  const filterResults = query.filters.map(filter => evaluateFilter(recordData, filter));

  return query.logic === 'AND'
    ? filterResults.every(r => r)  // All filters must match
    : filterResults.some(r => r);   // At least one filter must match
}

/**
 * Filter an array of records using a query
 */
export function filterRecords<T extends { data: any }>(
  records: T[],
  query: ScheduleQuery
): T[] {
  return records.filter(record => evaluateQuery(record.data, query));
}

/**
 * Legacy: Parse old string-based queries for backward compatibility
 */
export function parseStringQuery(queryString: string): ScheduleQuery | null {
  // Parse "field equals 'value'" format
  const equalsMatch = queryString.match(/(\w+)\s+equals\s+['"](.*?)['"]/i);
  if (equalsMatch) {
    const [, fieldName, value] = equalsMatch;
    return {
      filters: [{ field: fieldName, operator: 'equals', value }],
      logic: 'AND'
    };
  }

  // Can't parse - return null to use fallback
  return null;
}

/**
 * Human-readable description of a query
 */
export function describeQuery(query: ScheduleQuery): string {
  const descriptions = query.filters.map(f => {
    switch (f.operator) {
      case 'equals': return `${f.field} equals "${f.value}"`;
      case 'not_equals': return `${f.field} does not equal "${f.value}"`;
      case 'contains': return `${f.field} contains "${f.value}"`;
      case 'is_empty': return `${f.field} is empty`;
      case 'is_not_empty': return `${f.field} is not empty`;
      case 'greater_than': return `${f.field} > ${f.value}`;
      case 'less_than': return `${f.field} < ${f.value}`;
      case 'in': return `${f.field} in [${f.value.join(', ')}]`;
      default: return `${f.field} ${f.operator} ${f.value}`;
    }
  });

  return descriptions.join(` ${query.logic} `);
}



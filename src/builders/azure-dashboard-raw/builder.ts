/**
 * Azure Dashboard Raw Builder.
 * Generates raw Azure dashboard JSON from OpenAPI specification.
 */

import type { TemplateContext } from "../../core/template/context.schema.js";
import type { OA3Spec } from "./builder.schema.js";

import { Builder } from "../base.js";
import { OA3SpecSchema } from "./builder.schema.js";
import { extractEndpoints } from "./endpoints-extractor.js";
import { azureDashboardRawTemplate } from "./template.js";

export class AzDashboardRawBuilder extends Builder<TemplateContext> {
  private evaluationFrequency: number;
  private evaluationTimeWindow: number;
  private eventOccurrences: number;
  private oa3Spec: OA3Spec;

  constructor(
    oa3Spec: unknown,
    name: string,
    resourceType: string,
    location: string,
    timespan: string,
    evaluationFrequency: number,
    evaluationTimeWindow: number,
    eventOccurrences: number,
    resources: string[],
    queries?: {
      response_time_percentile: number;
      status_code_categories: string[];
    },
    availabilityThreshold?: number,
    responseTimeThreshold?: number,
  ) {
    super(azureDashboardRawTemplate, {
      action_groups_ids: [],
      availability_threshold: availabilityThreshold,
      data_source_id: resources[0],
      endpoints: {},
      evaluation_frequency: evaluationFrequency,
      event_occurrences: eventOccurrences,
      hosts: [],
      location,
      name,
      queries,
      resource_type: resourceType,
      response_time_threshold: responseTimeThreshold,
      time_window: evaluationTimeWindow,
      timespan,
    });

    // Validate OA3 spec structure
    this.oa3Spec = OA3SpecSchema.parse(oa3Spec);
    this.evaluationFrequency = evaluationFrequency;
    this.evaluationTimeWindow = evaluationTimeWindow;
    this.eventOccurrences = eventOccurrences;
  }

  /**
   * Render the template by extracting endpoints from OA3 spec and merging with overrides.
   */
  produce(values: Partial<TemplateContext> = {}): string {
    // Extract hosts and endpoints from OA3 spec
    const { endpoints, hosts } = extractEndpoints(
      this.oa3Spec,
      this.evaluationFrequency,
      this.evaluationTimeWindow,
      this.eventOccurrences,
      this.properties.availability_threshold,
      this.properties.response_time_threshold,
    );

    // Update properties with extracted data
    this.properties.hosts = hosts;
    this.properties.endpoints = endpoints;

    // Normalize endpoint overrides to support "METHOD /path" format
    // Convert "METHOD /path" keys to "/path" keys with method in the value
    const mergedValues = values.endpoints
      ? (() => {
          const normalizedEndpoints: typeof values.endpoints = {};

          for (const [key, value] of Object.entries(values.endpoints)) {
            // Check if key has "METHOD /path" format
            const spaceIndex = key.indexOf(" ");
            if (spaceIndex > 0) {
              // Extract method and path
              const method = key.substring(0, spaceIndex);
              const path = key.substring(spaceIndex + 1);

              // Only add as path-only key with method in the value
              // Don't set props.path to avoid duplicating basePath in query functions
              // This allows the "METHOD /path" override to match "/path" base
              normalizedEndpoints[path] = {
                ...value,
                method,
              };
            } else {
              // Keep path-only overrides as is
              normalizedEndpoints[key] = value;
            }
          }

          return { ...values, endpoints: normalizedEndpoints };
        })()
      : values;

    // Render template with merged values
    return super.produce(mergedValues);
  }
}

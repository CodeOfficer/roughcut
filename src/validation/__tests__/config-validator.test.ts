/**
 * Test suite for RevealJS Configuration Validation
 * Phase 2 of RevealJS Best Practices Migration
 */

import { describe, it, expect } from 'vitest';
import { validateConfig, validatePreset, formatValidationErrors } from '../config-validator.js';

describe('Config Validator', () => {
  // ==========================================================================
  // PRESET VALIDATION
  // ==========================================================================

  describe('validatePreset', () => {
    it('should accept valid preset: video-recording', () => {
      const result = validatePreset('video-recording');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid preset: manual-presentation', () => {
      const result = validatePreset('manual-presentation');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid preset: auto-demo', () => {
      const result = validatePreset('auto-demo');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid preset: speaker-mode', () => {
      const result = validatePreset('speaker-mode');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject invalid preset', () => {
      const result = validatePreset('invalid-preset');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain('Unknown preset');
    });

    it('should suggest closest match for typo', () => {
      const result = validatePreset('manuel-presentation');
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.suggestion).toContain('manual-presentation');
    });

    it('should provide expected values for invalid preset', () => {
      const result = validatePreset('custom');
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.expected).toContain('video-recording');
      expect(result.errors[0]?.expected).toContain('manual-presentation');
    });
  });

  // ==========================================================================
  // CONFIG VALIDATION - TYPE CHECKING
  // ==========================================================================

  describe('validateConfig - Type Validation', () => {
    it('should accept valid boolean config option', () => {
      const result = validateConfig({ controls: true });
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid number config option', () => {
      const result = validateConfig({ viewDistance: 5 });
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid string config option', () => {
      const result = validateConfig({ transition: 'fade' });
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject invalid type for boolean field', () => {
      const result = validateConfig({ controls: 'yes' as any });
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('Invalid value');
    });

    it('should reject invalid type for number field', () => {
      const result = validateConfig({ viewDistance: 'five' as any });
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('number');
    });

    it('should accept special value for controls (speaker-only)', () => {
      const result = validateConfig({ controls: 'speaker-only' as any });
      expect(result.valid).toBe(true);
    });

    it('should accept null for nullable fields', () => {
      const result = validateConfig({ autoPlayMedia: null });
      expect(result.valid).toBe(true);
    });

    it('should accept false for autoSlide', () => {
      const result = validateConfig({ autoSlide: false as any });
      expect(result.valid).toBe(true);
    });
  });

  // ==========================================================================
  // CONFIG VALIDATION - ENUM VALUES
  // ==========================================================================

  describe('validateConfig - Enum Validation', () => {
    it('should accept valid transition value', () => {
      const transitions = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];
      for (const transition of transitions) {
        const result = validateConfig({ transition: transition as any });
        expect(result.valid).toBe(true);
      }
    });

    it('should reject invalid transition value', () => {
      const result = validateConfig({ transition: 'invalid' as any });
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('transition');
    });

    it('should suggest closest match for typo in enum', () => {
      const result = validateConfig({ transition: 'slied' as any });
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.suggestion).toContain('slide');
    });

    it('should accept valid transitionSpeed', () => {
      const speeds = ['default', 'fast', 'slow'];
      for (const speed of speeds) {
        const result = validateConfig({ transitionSpeed: speed as any });
        expect(result.valid).toBe(true);
      }
    });

    it('should accept valid navigationMode', () => {
      const modes = ['default', 'linear', 'grid'];
      for (const mode of modes) {
        const result = validateConfig({ navigationMode: mode as any });
        expect(result.valid).toBe(true);
      }
    });

    it('should accept valid slideNumber formats', () => {
      const formats = [false, true, 'h.v', 'h/v', 'c', 'c/t'];
      for (const format of formats) {
        const result = validateConfig({ slideNumber: format as any });
        expect(result.valid).toBe(true);
      }
    });

    it('should reject invalid slideNumber format', () => {
      const result = validateConfig({ slideNumber: 'invalid' as any });
      expect(result.valid).toBe(false);
    });

    it('should accept valid controlsLayout', () => {
      const layouts = ['bottom-right', 'edges'];
      for (const layout of layouts) {
        const result = validateConfig({ controlsLayout: layout as any });
        expect(result.valid).toBe(true);
      }
    });

    it('should accept valid controlsBackArrows', () => {
      const options = ['faded', 'hidden', 'visible'];
      for (const option of options) {
        const result = validateConfig({ controlsBackArrows: option as any });
        expect(result.valid).toBe(true);
      }
    });
  });

  // ==========================================================================
  // CONFIG VALIDATION - UNKNOWN FIELDS
  // ==========================================================================

  describe('validateConfig - Unknown Fields', () => {
    it('should reject unknown config field', () => {
      const result = validateConfig({ unknownOption: true } as any);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('Unknown config option');
    });

    it('should suggest closest match for typo in field name', () => {
      const result = validateConfig({ controles: true } as any);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.suggestion).toContain('controls');
    });

    it('should suggest closest match for similar field name', () => {
      const result = validateConfig({ progressBar: true } as any);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.suggestion).toContain('progress');
    });
  });

  // ==========================================================================
  // CONFIG VALIDATION - MULTIPLE ERRORS
  // ==========================================================================

  describe('validateConfig - Multiple Errors', () => {
    it('should report multiple validation errors', () => {
      const result = validateConfig({
        controls: 'yes' as any,
        transition: 'invalid' as any,
        viewDistance: 'many' as any,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(3);
    });

    it('should validate all fields even if some are invalid', () => {
      const result = validateConfig({
        controls: true, // valid
        transition: 'invalid' as any, // invalid
        progress: true, // valid
        viewDistance: 'text' as any, // invalid
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
      expect(result.errors.some(e => e.field === 'transition')).toBe(true);
      expect(result.errors.some(e => e.field === 'viewDistance')).toBe(true);
    });
  });

  // ==========================================================================
  // CONFIG VALIDATION - COMPLEX OPTIONS
  // ==========================================================================

  describe('validateConfig - Complex Options', () => {
    it('should accept valid complete config', () => {
      const result = validateConfig({
        controls: true,
        progress: true,
        slideNumber: 'c/t',
        hash: true,
        history: true,
        keyboard: true,
        overview: true,
        center: true,
        touch: true,
        loop: false,
        transition: 'slide',
        transitionSpeed: 'default',
        viewDistance: 3,
      });
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept presentation size options', () => {
      const result = validateConfig({
        width: 1920,
        height: 1080,
        margin: 0.1,
        minScale: 0.2,
        maxScale: 2.0,
      });
      expect(result.valid).toBe(true);
    });

    it('should accept auto-animate options', () => {
      const result = validateConfig({
        autoAnimate: true,
        autoAnimateEasing: 'ease',
        autoAnimateDuration: 1.0,
        autoAnimateUnmatched: true,
      });
      expect(result.valid).toBe(true);
    });

    it('should accept PDF export options', () => {
      const result = validateConfig({
        pdfMaxPagesPerSlide: 1,
        pdfSeparateFragments: true,
        pdfPageHeightOffset: -1,
      });
      expect(result.valid).toBe(true);
    });
  });

  // ==========================================================================
  // ERROR FORMATTING
  // ==========================================================================

  describe('formatValidationErrors', () => {
    it('should format single error with all details', () => {
      const result = validateConfig({ transition: 'invalid' as any });
      const formatted = formatValidationErrors(result.errors);

      expect(formatted).toContain('CONFIGURATION VALIDATION ERRORS');
      expect(formatted).toContain('transition');
      expect(formatted).toContain('invalid');
      expect(formatted).toContain('Expected:');
    });

    it('should format multiple errors', () => {
      const result = validateConfig({
        transition: 'bad' as any,
        controls: 'yes' as any,
      });
      const formatted = formatValidationErrors(result.errors);

      expect(formatted).toContain('Found 2 error(s)');
      expect(formatted).toContain('transition');
      expect(formatted).toContain('controls');
    });

    it('should include suggestions in formatted output', () => {
      const result = validateConfig({ controles: true } as any);
      const formatted = formatValidationErrors(result.errors);

      expect(formatted).toContain('controls');
      expect(formatted).toContain('Did you mean');
    });

    it('should include documentation reference', () => {
      const result = validateConfig({ invalid: true } as any);
      const formatted = formatValidationErrors(result.errors);

      expect(formatted).toContain('docs/architecture/revealjs/CONFIGURATION.md');
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('validateConfig - Edge Cases', () => {
    it('should accept empty config', () => {
      const result = validateConfig({});
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle numeric string values for enums', () => {
      const result = validateConfig({ slideNumber: 'c/t' });
      expect(result.valid).toBe(true);
    });

    it('should validate keyboardCondition with null', () => {
      const result = validateConfig({ keyboardCondition: null });
      expect(result.valid).toBe(true);
    });

    it('should validate keyboardCondition with focused', () => {
      const result = validateConfig({ keyboardCondition: 'focused' });
      expect(result.valid).toBe(true);
    });
  });
});

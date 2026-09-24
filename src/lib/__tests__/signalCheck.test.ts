import { describe, it, expect } from 'vitest';
import { heuristicFallbackAnalysis } from '../deepseek';
import { getStatusTheme, getSourceBadgeInfo, getUrgencyBadgeClasses } from '../utils';

describe('SafeRoute Signal AI & Business Logic', () => {
  describe('AI Rumour & Firsthand Signal Extraction', () => {
    it('correctly classifies firsthand driver reports with high confidence', () => {
      const input = 'I just drove my truck past North Gate road at 6:42 PM. Road is totally clear, vigilante post gave thumbs up.';
      const result = heuristicFallbackAnalysis(input);

      expect(result.is_firsthand).toBe(true);
      expect(result.source_type).toBe('FIRSTHAND_OBSERVATION');
      expect(result.confidence).toBeGreaterThanOrEqual(85);
      expect(result.needs_human_review).toBe(false);
      expect(result.location).toContain('North Gate');
    });

    it('flags unverified WhatsApp forwards as hearsay with low confidence', () => {
      const input = 'URGENT PLEASE SHARE: My neighbour said her sister heard gunshots near the eastern bridge area! Stay indoors everyone panic!!';
      const result = heuristicFallbackAnalysis(input);

      expect(result.is_firsthand).toBe(false);
      expect(result.source_type).toBe('UNVERIFIED_WHATSAPP');
      expect(result.confidence).toBeLessThanOrEqual(40);
      expect(result.needs_human_review).toBe(true);
      expect(result.location).toContain('Eastern River Bypass & Bridge');
    });

    it('classifies community patrol radio dispatches with high confidence and authority', () => {
      const input = 'Community patrol radio broadcast (Channel 4): South Highway Kilometer 4 is closed due to emergency security diversion.';
      const result = heuristicFallbackAnalysis(input);

      expect(result.source_type).toBe('COMMUNITY_RADIO');
      expect(result.is_firsthand).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(85);
      expect(result.needs_human_review).toBe(false);
      expect(result.location).toContain('South Highway');
    });
  });

  describe('UI & Status Helpers', () => {
    it('returns appropriate theme tokens for SAFE status', () => {
      const theme = getStatusTheme('SAFE');
      expect(theme.label).toBe('Safe to Travel');
      expect(theme.textColor).toContain('emerald');
    });

    it('returns appropriate theme tokens for CAUTION status', () => {
      const theme = getStatusTheme('CAUTION');
      expect(theme.label).toBe('Proceed with Caution');
      expect(theme.textColor).toContain('amber');
    });

    it('returns appropriate theme tokens for DANGER status', () => {
      const theme = getStatusTheme('DANGER');
      expect(theme.label).toBe('High Risk / Avoid');
      expect(theme.textColor).toContain('rose');
    });

    it('returns correct source badge labels and styles', () => {
      const firsthand = getSourceBadgeInfo('FIRSTHAND_OBSERVATION', true);
      expect(firsthand.label).toBe('Direct Firsthand Witness');

      const whatsapp = getSourceBadgeInfo('UNVERIFIED_WHATSAPP', false);
      expect(whatsapp.label).toBe('WhatsApp Forward (Unverified)');
    });

    it('returns urgency classes for all levels', () => {
      expect(getUrgencyBadgeClasses('CRITICAL')).toContain('rose');
      expect(getUrgencyBadgeClasses('HIGH')).toContain('orange');
      expect(getUrgencyBadgeClasses('MEDIUM')).toContain('amber');
      expect(getUrgencyBadgeClasses('LOW')).toContain('zinc');
    });
  });
});

import { describe, it, afterEach, beforeEach } from '@std/testing/bdd';
import { expect } from '@std/expect';

import {
  assertSpyCall,
  assertSpyCalls,
  spy,
  type Spy
} from "@std/testing/mock";

import * as main from '../src/main.ts';


describe('DeveloperError', () => {
  let infoSpy:Spy;
  let errorSpy:Spy;

  beforeEach(() => {
    infoSpy = spy(main.LOGGER, 'info');
    errorSpy = spy(main.LOGGER, 'error');
  });
  afterEach(() => {
    infoSpy.restore();
    errorSpy.restore();
  });
  describe('spies', () => {
    describe('info', () => {
      it('should not have any calls without doing a call first', () => {
        assertSpyCalls(infoSpy, 0);
      });
      it('will be called a', () => {
        assertSpyCalls(infoSpy, 0);
        main.LOGGER.info('some message');
        assertSpyCalls(infoSpy, 1);

        assertSpyCall(infoSpy, 0, ({ args: ['some message'] }));
      });
    });
    describe('error', () => {
      it('should not have any calls without doing a call first', () => {
        assertSpyCalls(errorSpy, 0);
      });
      it('will be called a', () => {
        assertSpyCalls(errorSpy, 0);
        main.LOGGER.error('some message');
        assertSpyCalls(errorSpy, 1);

        assertSpyCall(errorSpy, 0, ({ args: ['some message'] }));
      });
    });
  });
});

describe('salesforce-cli-repl', () => {
  describe('error levels', () => {
    it('should have a negative error level for none', () => {
      const errorLevel = main.ERROR_LEVEL_NONE;
      expect(errorLevel).toBeLessThan(0);
    });
    it('should have a positive error level for detailed', () => {
      const errorLevel = main.ERROR_LEVEL_DETAILED;
      expect(errorLevel).toBeGreaterThan(0);
    });
    it('should be zero for basic', () => {
      const errorLevel = main.ERROR_LEVEL_BASIC;
      expect(errorLevel).toBe(0);
    });
  });
});

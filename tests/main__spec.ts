import { describe, it, afterEach, beforeEach } from '@std/testing/bdd';
import { expect } from '@std/expect';

import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "@std/testing/mock";

import * as main from '../src/main.ts';

describe('subtract', () => {
	it('can subtract', () => {
		const a = 5;
		const b = 2;
		const expected = 3;
		const result = main.subtract(a,b);

		expect(result).toBe(expected);
	});
});

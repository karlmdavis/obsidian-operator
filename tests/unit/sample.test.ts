// Sample test to verify test setup works
import { expect, test } from "bun:test";

test("sample test", () => {
	expect(1 + 1).toBe(2);
});

test("DOM is available", () => {
	document.body.innerHTML = "<button>Test Button</button>";
	const button = document.querySelector("button");
	expect(button?.textContent).toBe("Test Button");
});

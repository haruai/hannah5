import { test, expect } from '@playwright/test';
test('room loads without errors and has no letter UI or request', async ({page}) => {
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
  page.on('request',r=>requests.push(r.url()));
  await page.goto('/');
  await expect(page.locator('#loading')).toBeHidden();
  await expect(page.locator('#envelope, #letter, #shade')).toHaveCount(0);
  expect(requests.some(u=>u.endsWith('/letter.json'))).toBe(false);
  expect(errors).toEqual([]);
});

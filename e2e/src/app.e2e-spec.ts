import { AppPage } from './app.po';

describe('new App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display master password field label', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toContain('Master password');
  });
});

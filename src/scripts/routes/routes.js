import HomePage from '../pages/home/home-page';
import StoriesPresenter from '../presenters/StoriesPresenter';
import AddStoryPage from '../pages/add-story/add-story-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import FavoritesPage from '../pages/favorites/favorites-page';
import SettingsPage from '../pages/settings/settings-page';

const routes = {
  '/': new HomePage(),
  '/stories': new StoriesPresenter(),
  '/add-story': new AddStoryPage(),
  '/favorites': FavoritesPage,
  '/settings': SettingsPage,
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;

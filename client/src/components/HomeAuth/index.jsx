import UserFetch from '../../fetch/UserFetch';

export default function HomeAuth() {
  function loginPrompt() {
    const employeeId = window.prompt('What is the employeeId?');
    const password = window.prompt('What is the password?');

    if (employeeId && password) {
      handleLogin({ employeeId, password });
    } else {
      document.body.innerHTML = `
            <div>
              <p>Login failed. Please refresh the page to retry.</p>
            </div>
          `;
    }
  }

  async function handleLogin({ employeeId, password }) {
    try {
      const login = await UserFetch.loginHandler({
        employeeId,
        password,
      });
      if (login) {
        localStorage.setItem(
          'bookmarks',
          JSON.stringify(login.user.bookmarks)
        );
        localStorage.setItem('region', login.user.region);
        localStorage.setItem('userId', login.user._id);
        window.location.reload(); // Force reload to reflect authentication
      } else {
        document.body.innerHTML = `
              <div>
                <p>Login failed. Please refresh the page to retry.</p>
              </div>
            `;
      }
    } catch (error) {
      console.error('Login failed:', error);
      document.body.innerHTML = `
            <div>
              <p>Login failed. Please refresh the page to retry.</p>
            </div>
          `;
    }
  }

  return loginPrompt();
}

export default function getWeather(state, setState) {
    const apiKey = '7274ad2eb9ee1b856f3e2f4d323703e3';
    const coordinates = {
      georgia: {
        lat: '33.798350',
        long: '-84.279170',
      },
      texas: {
        lat: '32.947800',
        long: '-96.737630',
      },
      florida: {
        lat: '28.079280',
        long: '-82.507830',
      },
    };
    if (localStorage.getItem('location') == 'georgia') {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.georgia.lat}&lon=${coordinates.georgia.long}&appid=${apiKey}&units=imperial`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setState(data));
    }

    if (localStorage.getItem('location') == 'texas') {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.texas.lat}&lon=${coordinates.texas.long}&appid=${apiKey}&units=imperial`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setState(data));
    }

    if (localStorage.getItem('location') == 'florida') {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.florida.lat}&lon=${coordinates.florida.long}&appid=${apiKey}&units=imperial`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setState(data));
    }
  }
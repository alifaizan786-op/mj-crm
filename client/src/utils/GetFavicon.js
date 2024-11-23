export default function getFavicon(link) {
  return fetch(`/api/utility/getFavicon?url=${link}`)
    .then((res) => res.json())
    .then((data) => {
      return data?.imageLinks[0];
    })
    .catch((error) => {
      console.error('Error fetching image link:', error);
      return null;
    });
}

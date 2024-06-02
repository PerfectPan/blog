const HEADER_HEIGHT = 64;
const SAFE_HEIGHT = 16;

export const scrollTo = (id: string) => {
  const element = document.getElementById(id);

  if (element) {
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const targetPosition = elementTop - (HEADER_HEIGHT + SAFE_HEIGHT);

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }
};

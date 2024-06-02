export default async function NotFoundPage() {
  return (
    <div className='flex flex-col items-center justify-center text-2xl'>
      你闯入了无人之境...
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  };
};

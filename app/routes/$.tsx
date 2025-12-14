import { json } from '@remix-run/node';

export const loader = () => {
  return json({}, { status: 404 });
};

export default function NotFoundPage() {
  return (
    <div className='flex flex-col items-center justify-center text-2xl'>
      你闯入了无人之境...
    </div>
  );
}

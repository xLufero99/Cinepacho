export default function LoginBackground() {

  return (
    <>

      <div className="
        absolute inset-0
        opacity-10
        pointer-events-none
      ">

        <div
          className="
            absolute inset-0
            bg-cover bg-center
          "
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070')"
          }}
        />

      </div>

      <div className="
        absolute top-[-150px] left-[-100px]
        w-[400px] h-[400px]
        bg-primary/10
        rounded-full blur-3xl
      " />

      <div className="
        absolute bottom-[-150px] right-[-100px]
        w-[400px] h-[400px]
        bg-red-700/10
        rounded-full blur-3xl
      " />

    </>
  );
}
import LockIcon from '@mui/icons-material/Lock';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GitHubIcon from '@mui/icons-material/GitHub';

export function Explainer (){



return(
  <div className="flex flex-col  mx-auto max-w-[900px] pb-20 sm:px-6 lg:px-6">
<div className="flex flex-col sm:flex-row justify-between max-w-screen-lg mx-auto sm:my-8">
      {/* Single Feature */}
      <div className="flex flex-col p-4  sm:w-1/2" >
        <div className="flex flex-row text-center items-center">
            
                <LockIcon className="text-white"/>
        
        <h2 className="font-bold text-lg ml-4 text-white">Private</h2>
        </div>
        <p className="mt-4 text-sm text-zinc-300 ">
        PrivateConverter handles all the process in your browser.  We don't see or store your files. Your data stays yours.        </p>
      </div>

      {/* Duplicate the above block for each feature */}
      <div className="flex flex-col p-4  sm:w-1/2 ml-5">
        <div className="flex flex-row text-center items-center">
            
            <RocketLaunchIcon className="text-white"/>
        
        <h2 className="font-bold text-lg ml-4 text-white">Fast</h2>
        </div>
        <p className="mt-4 text-sm text-zinc-300">
        Local processing means no back and forth with servers, which makes  the conversion process much faster.        </p>
      </div>
</div>

      
<div className="flex flex-col  sm:flex-row justify-between max-w-screen-lg mx-auto sm:my-8">
      {/* Single Feature */}
      <div className="flex flex-col p-4 col-span-1 sm:w-1/2">
        <div className="flex flex-row text-center items-center">
            
                <CheckCircleIcon className="text-white"/>
        
        <h2 className="font-bold text-lg ml-4 text-white">Free</h2>
        </div>
        <p className="mt-4 text-sm text-zinc-300">
        PrivateConverter is a free tool. We don’t charge for conversions, we don’t have any ads, and we intend to do neither in the foreseeable future.        </p>
      </div>

      {/* Duplicate the above block for each feature */}
      <div className="flex flex-col p-4 col-span-1 sm:w-1/2 ml-5">
        <div className="flex flex-row text-center items-center">
            
                <GitHubIcon className="text-white" />
        
        <h2 className="font-bold text-lg ml-4 text-white">Open Source</h2>
        </div>
        <p className="mt-4 text-sm text-zinc-300">
        The software behind PrivateConverter is open source. You can check the GitHub page <a className="underline cursor-pointer">here</a>.        </p>
      </div>
</div>
      </div>
  );


}
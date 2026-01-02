import { GlitchText } from '@/components/ui/GlitchText';
import { GrainTexture } from '@/components/ui/GrainTexture';

/**
 * AboutPage
 * 
 * Experimental about page with bold typography, minimal text, video-first approach
 * Carson: Experimental typography, break conventions, asymmetrical layout
 * Oliver: Dark, cinematic, distressed textures
 * Strauss: Bold, viral-worthy
 * Weirdcore: Glitch effects
 * 
 * STEP-310: Redesign AboutPage with asymmetrical layout
 */

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Carson: Experimental typography layout - Asymmetrical */}
        <div className="max-w-6xl mx-auto">
          {/* Main headline - Asymmetrical, experimental typography */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-4 transform rotate-neg05">
              <GlitchText intensity="medium">IMANOL</GlitchText>
            </h1>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter ml-8 md:ml-16 transform rotate-05">
              VILLAGOMEZ
            </h1>
          </div>

          {/* Content sections - Asymmetrical columns */}
          <div className="space-y-8 md:space-y-12">
            {/* Section 1 - Left aligned with rotation */}
            <div className="relative">
              <GrainTexture />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 transform rotate-05">
                  VIDEographer
                </h2>
                <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                  Creating experimental, boundary-pushing video work that challenges conventions.
                  Specializing in music videos, creative direction, and visual storytelling.
                </p>
              </div>
            </div>

            {/* Section 2 - Right offset with red border (Gore core accent) */}
            <div className="relative ml-0 md:ml-12 lg:ml-24">
              <div className="border-l-4 border-red-primary pl-6 md:pl-8">
                <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">
                  EXPERIMENTAL
                </h2>
                <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                  Every project is an opportunity to push creative boundaries. 
                  Raw, unapologetic, and unforgettable.
                </p>
              </div>
            </div>

            {/* Section 3 - Left aligned with slight rotation */}
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 transform rotate-neg05">
                WORK
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base text-zinc-400 uppercase tracking-wider">
                <div>
                  <span className="text-white font-bold">MUSIC VIDEOS</span>
                  <br />
                  <span>ARTISTS • LABELS • INDEPENDENT</span>
                </div>
                <div>
                  <span className="text-red-primary font-bold">CREATIVE DIRECTION</span>
                  <br />
                  <span>VISUAL STORYTELLING • CONCEPTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section - Bold, minimal (West's minimalism) */}
          <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-zinc-800">
            <a
              href="/contact"
              className="inline-block bg-white hover:bg-white/90 text-black font-black px-8 py-4 md:px-12 md:py-6 text-lg md:text-xl uppercase tracking-tighter transition-colors duration-200"
            >
              LET'S WORK
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

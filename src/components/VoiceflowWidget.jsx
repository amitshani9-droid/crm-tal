import { useEffect } from 'react';

const VoiceflowWidget = () => {
  useEffect(() => {
    (function(d, t) {
      var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
      v.onload = function() {
        if (window.voiceflow && window.voiceflow.chat) {
          window.voiceflow.chat.load({
            verify: { projectID: '69b05e75bc4cc4c1dbe80dc2' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production',
            voice: {
              url: "https://runtime-api.voiceflow.com"
            }
          });
        }
      }
      v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; 
      v.type = "text/javascript"; 
      if (s && s.parentNode) {
        s.parentNode.insertBefore(v, s);
      } else {
        d.body.appendChild(v);
      }
      
      // Store reference for unmounting
      window.__vf_script = v;
  })(document, 'script');

    return () => {
      // Cleanup script on unmount
      if (window.__vf_script && window.__vf_script.parentNode) {
        window.__vf_script.parentNode.removeChild(window.__vf_script);
      }
      // Remove any injected Voiceflow widget wrappers if the user logs out
      const vfElement = document.getElementById('voiceflow-chat-frame') || document.querySelector('div[id^="voiceflow"]');
      if (vfElement) {
        vfElement.remove();
      }
      if (window.voiceflow) {
          delete window.voiceflow;
      }
    };
  }, []);

  return null; // This component doesn't render any visible UI itself
};

export default VoiceflowWidget;

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

// Override default blue with your orange theme
const STYLE = `
  #nprogress .bar {
    background: #FF9933 !important;
    height: 3px !important;
  }
  #nprogress .peg {
    box-shadow: 0 0 10px #FF9933, 0 0 5px #FF9933 !important;
  }
`;

export default function NavigationLoader() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 500);
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  return <style>{STYLE}</style>;
}
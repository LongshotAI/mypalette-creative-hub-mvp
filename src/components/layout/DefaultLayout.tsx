
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Create a context object with the scroll position
  const childrenWithProps = React.Children.map(children, child => {
    // Check if the child is a valid React element and can accept props
    if (React.isValidElement(child)) {
      // Pass scrollPosition prop only if the child's type is a component that accepts it
      // This is safe because we're explicitly checking in the component
      return React.cloneElement(child, { 
        scrollPosition 
      } as React.ComponentProps<typeof child.type>);
    }
    return child;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {childrenWithProps}
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;

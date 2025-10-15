import React, { useRef, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Image, Pressable, Linking, Animated, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Web: hover styling is handled via the Hoverable component (Pressable + Animated)

// Module-level Hoverable to avoid recreation on each render (better performance)
const isWeb = Platform.OS === 'web';
// Animated Pressable so the whole button (not only inner content) can be animated
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Hoverable: React.FC<any> = ({ children, style, onPress, hoverStyle, pressStyle, ...props }) => {
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleHoverIn = () => {
    setIsHovered(true);
    if (Platform.OS === 'web' || Platform.OS === 'ios' || Platform.OS === 'android') {
      Animated.timing(hoverAnim, { toValue: -6, duration: 100, useNativeDriver: !isWeb }).start();
    }
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    if (Platform.OS === 'web' || Platform.OS === 'ios' || Platform.OS === 'android') {
      Animated.timing(hoverAnim, { toValue: 0, duration: 100, useNativeDriver: !isWeb }).start();
    }
  };

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const animatedStyle: any = {
    transform: [{ translateY: hoverAnim }],
    ...(Platform.OS === 'web' ? { transition: 'background-color 120ms ease, color 120ms ease' } as any : {}),
    backgroundColor: isPressed && pressStyle?.backgroundColor ? pressStyle.backgroundColor : (isHovered && hoverStyle?.backgroundColor ? hoverStyle.backgroundColor : style?.backgroundColor),
  };

  const textColor = isPressed && pressStyle?.color ? pressStyle.color : (isHovered && hoverStyle?.color ? hoverStyle.color : (children as any).props?.style?.color);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
      {...props}
      // Apply both layout and animated styles to the pressable container
      style={[style, animatedStyle, { alignItems: 'center', justifyContent: 'center' }]}
    >
      {React.isValidElement(children) ? (
        (children as any).type === Text ? (
          <Text {...(children as any).props} style={[ (children as any).props.style, { color: textColor } ]}>
            {(children as any).props.children}
          </Text>
        ) : (
          React.cloneElement(children as any, { style: [ (children as any).props.style, textColor ? { color: textColor } : {} ] })
        )
      ) : (
        children
      )}
    </AnimatedPressable>
  );
};

export default function App() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isMobile, setIsMobile] = useState<boolean>(width < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current; // 0 hidden, 1 visible

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const w = isWeb ? window.innerWidth : Dimensions.get('window').width;
      setIsMobile(w < 768);
    };
    if (isWeb) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    // native fallback
    const sub: any = Dimensions.addEventListener?.('change', handleResize as any);
    return () => sub?.remove?.();
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(menuAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  };
  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start(() => setMenuOpen(false));
  };
  const [activeSection, setActiveSection] = useState('hero');
  const [sectionOffsets, setSectionOffsets] = useState<{ [key: string]: number }>({});
  const NAVBAR_HEIGHT = 64; // approximate fixed navbar height used for offset correction on mobile
  const [typedText, setTypedText] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [notification, setNotification] = useState('');
  const [notificationSlide] = useState(new Animated.Value(300));
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Animated values for each section
  const heroImageAnim = useRef(new Animated.Value(1)).current;
  const heroImageFloat = useRef(new Animated.Value(0)).current;
  const heroTitleAnim = useRef(new Animated.Value(0)).current;
  const heroSubtitleAnim = useRef(new Animated.Value(0)).current;
  const heroButtonsAnim = useRef(new Animated.Value(0)).current;
  const cursorBlink = useRef(new Animated.Value(1)).current;
  const navUnderlineWidth = useRef(new Animated.Value(0)).current;
  const navUnderlineLeft = useRef(new Animated.Value(0)).current;
  const [navPositions, setNavPositions] = useState<{ [key: string]: { x: number; width: number; textWidth?: number; textX?: number } }>({});
  const aboutTitleAnim = useRef(new Animated.Value(0)).current;
  const aboutTextAnim = useRef(new Animated.Value(0)).current;
  const aboutImageAnim = useRef(new Animated.Value(0)).current;
  const interestAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const projectAnims = Array.from({ length: 6 }, () => useRef(new Animated.Value(0)).current);
  const contactAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  

  // Track which sections have been animated
  const [sectionsAnimated, setSectionsAnimated] = useState({
    about: false,
    interests: false,
    projects: false,
    contact: false,
    footer: false,
  });

  // Hero animations on mount
  useEffect(() => {
    // Typing effect
    const titleText = 'dinonuwg';
    let i = 0;
    const typeWriter = () => {
      if (i < titleText.length) {
        setTypedText(titleText.slice(0, i + 1));
        i++;
        setTimeout(typeWriter, 150);
      } else {
        // Start cursor blinking after typing is done
        Animated.loop(
          Animated.sequence([
            Animated.timing(cursorBlink, { toValue: 0, duration: 500, useNativeDriver: !isWeb }),
            Animated.timing(cursorBlink, { toValue: 1, duration: 500, useNativeDriver: !isWeb }),
          ])
        ).start();
      }
    };
    typeWriter();

    // Float animation for hero image
    Animated.loop(
      Animated.sequence([
  Animated.timing(heroImageFloat, { toValue: 1, duration: 3000, useNativeDriver: !isWeb }),
  Animated.timing(heroImageFloat, { toValue: 0, duration: 3000, useNativeDriver: !isWeb }),
      ])
    ).start();

    // Staggered hero content animations
    Animated.sequence([
  Animated.timing(heroTitleAnim, { toValue: 1, duration: 800, delay: 500, useNativeDriver: !isWeb }),
  Animated.timing(heroSubtitleAnim, { toValue: 1, duration: 800, useNativeDriver: !isWeb }),
  Animated.timing(heroButtonsAnim, { toValue: 1, duration: 800, useNativeDriver: !isWeb }),
    ]).start();
  }, []);

  // Fetch GitHub projects
  useEffect(() => {
    const fetchGitHubProjects = async () => {
      try {
        const response = await fetch('https://api.github.com/users/dinonuwg/repos');
        const repos = await response.json();
        
        // Filter out the profile readme repo if it exists
        const filteredRepos = repos.filter((repo: any) => repo.name.toLowerCase() !== 'dinonuwg');
        
        const projectsData = filteredRepos.slice(0, 6).map((repo: any) => ({
          name: repo.name,
          description: repo.description || 'No description available.',
          url: repo.html_url,
          image: `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`,
        }));
        
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        // Fallback projects
        const fallbackProjects = [
          { name: 'Project 1', description: 'A cool project built with React Native.', url: 'https://github.com/dinonuwg', image: 'https://via.placeholder.com/200x200/ffffff/000000?text=Project' },
          { name: 'Project 2', description: 'Another awesome project.', url: 'https://github.com/dinonuwg', image: 'https://via.placeholder.com/200x200/ffffff/000000?text=Project' },
          { name: 'Project 3', description: 'Innovative solution.', url: 'https://github.com/dinonuwg', image: 'https://via.placeholder.com/200x200/ffffff/000000?text=Project' },
        ];
        setProjects(fallbackProjects);
      }
    };
    
    fetchGitHubProjects();
  }, []);

  const scrollToSection = (section: string) => {
    // Prefer measured offsets when available (better on mobile / dynamic content)
    const fallback: { [key: string]: number } = {
      hero: 0,
      about: height * 0.95,
      interests: height * 1.95,
      projects: height * 2.95,
      contact: height * 3.85,
    };
    let offset = typeof sectionOffsets[section] === 'number' ? sectionOffsets[section] : fallback[section];
    // On mobile, the measured positions can be tricky; nudge contact further down so it doesn't land on Projects
    if (isMobile && section === 'contact') {
      // stronger nudge: push almost to the bottom of the page minus navbar
      offset = offset + Math.round(height * 1.5) - NAVBAR_HEIGHT + 60; // tiny extra nudge
    }
    scrollViewRef.current?.scrollTo({ y: Math.max(0, offset), animated: true });
  };

  // Animate nav underline position and width when active section or measured positions change
  useEffect(() => {
    const pos = navPositions[activeSection];
    // Prefer precise text measurements (textX/textWidth) when available
    if (pos && typeof pos.textWidth === 'number' && typeof pos.textX === 'number') {
      // shrink width by 10px and center by shifting left by 5px
      const targetWidth = Math.max(0, pos.textWidth - 10);
      const left = pos.x + pos.textX + Math.round((pos.textWidth - targetWidth) / 2);
      const currentWidth = (navUnderlineWidth as any)._value ?? 0;
      Animated.parallel([
        Animated.timing(navUnderlineLeft, { toValue: left, duration: 300, useNativeDriver: false }),
        Animated.timing(navUnderlineWidth, { toValue: targetWidth, duration: 200, useNativeDriver: false }),
      ]).start();
    } else if (pos && typeof pos.x === 'number' && typeof pos.width === 'number') {
      const targetWidth = Math.max(0, pos.width - 10);
      const left = pos.x + Math.round((pos.width - targetWidth) / 2);
      const currentWidth = (navUnderlineWidth as any)._value ?? 0;
      Animated.parallel([
        Animated.timing(navUnderlineLeft, { toValue: left, duration: 300, useNativeDriver: false }),
        Animated.timing(navUnderlineWidth, { toValue: targetWidth, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  }, [activeSection, navPositions]);

  // On web, measure actual DOM text widths for pixel-perfect underline sizing
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const measureDOMText = () => {
      try {
        const navContainer = document.querySelector('.nav-links') as HTMLElement | null;
        if (!navContainer) return;
        const navRect = navContainer.getBoundingClientRect();
        const links = navContainer.querySelectorAll('.nav-link[data-section]');
        links.forEach((el) => {
          const section = (el as HTMLElement).getAttribute('data-section') || '';
          const rect = (el as HTMLElement).getBoundingClientRect();
          const textWidth = rect.width;
          const textX = rect.left - navRect.left;
          setNavPositions(prev => {
            const existing = prev[section];
            if (existing && existing.textWidth === textWidth && existing.textX === textX && existing.x === existing.x && existing.width === existing.width) return prev;
            return { ...prev, [section]: { x: existing?.x ?? 0, width: existing?.width ?? textWidth, textWidth, textX } };
          });
        });
      } catch (err) {
        // ignore
      }
    };
    // measure after fonts/layout settle
    const t = setTimeout(measureDOMText, 80);
    window.addEventListener('resize', measureDOMText);
    measureDOMText();
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measureDOMText);
    };
  }, [activeSection]);

  // Scroll event handler
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    
    // Update active nav section with smooth transition
    let newSection = activeSection;
    if (y < height * 0.5) newSection = 'hero';
    else if (y < height * 1.5) newSection = 'about';
    else if (y < height * 2.5) newSection = 'interests';
    else if (y < height * 3.5) newSection = 'projects';
    else newSection = 'contact';

    if (newSection !== activeSection) {
      setActiveSection(newSection);
    }

    // Trigger animations when sections come into view (30% from top)
    const threshold = height * 0.3;

    // About section animation
    if (y > height * 0.95 - threshold && !sectionsAnimated.about) {
      setSectionsAnimated(prev => ({ ...prev, about: true }));
      Animated.parallel([
  Animated.timing(aboutTitleAnim, { toValue: 1, duration: 800, useNativeDriver: !isWeb }),
  Animated.timing(aboutTextAnim, { toValue: 1, duration: 1200, delay: 200, useNativeDriver: !isWeb }),
  Animated.timing(aboutImageAnim, { toValue: 1, duration: 1200, delay: 200, useNativeDriver: !isWeb }),
      ]).start();
    }

    // Interests section animation
    if (y > height * 1.95 - threshold && !sectionsAnimated.interests) {
      setSectionsAnimated(prev => ({ ...prev, interests: true }));
      interestAnims.forEach((anim, index) => {
        Animated.timing(anim, { 
          toValue: 1, 
          duration: 800, 
          delay: index * 200, 
          useNativeDriver: !isWeb 
        }).start();
      });
    }

    // Projects section animation
    if (y > height * 2.95 - threshold && !sectionsAnimated.projects) {
      setSectionsAnimated(prev => ({ ...prev, projects: true }));
      projectAnims.forEach((anim, index) => {
        Animated.timing(anim, { 
          toValue: 1, 
          duration: 800, 
          delay: index * 200, 
          useNativeDriver: !isWeb 
        }).start();
      });
    }

    // Contact section animation
    if (y > height * 3.95 - threshold && !sectionsAnimated.contact) {
      setSectionsAnimated(prev => ({ ...prev, contact: true }));
  Animated.timing(contactAnim, { toValue: 1, duration: 800, useNativeDriver: !isWeb }).start();
    }

    // Footer animation
    if (y > height * 4.5 - threshold && !sectionsAnimated.footer) {
      setSectionsAnimated(prev => ({ ...prev, footer: true }));
  Animated.timing(footerAnim, { toValue: 1, duration: 1000, useNativeDriver: !isWeb }).start();
    }
  };

  const showNotification = (message: string) => {
    // Cancel any existing notification animation and timeout
    if (notificationAnimRef.current) {
      notificationAnimRef.current.stop();
    }
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    // If there's a current notification, slide it out immediately
    if (notification !== '') {
      notificationSlide.setValue(300);
    }

    // Show new notification
    setNotification(message);
    notificationSlide.setValue(300);
    
    notificationAnimRef.current = Animated.timing(notificationSlide, {
      toValue: 0,
      duration: 400,
      useNativeDriver: !isWeb,
    });
    
    notificationAnimRef.current.start(() => {
      notificationTimeoutRef.current = setTimeout(() => {
        const slideOutAnim = Animated.timing(notificationSlide, {
          toValue: 300,
          duration: 400,
          useNativeDriver: !isWeb,
        });
        slideOutAnim.start(() => setNotification(''));
      }, 3000);
    });
  };

  const copyToClipboard = async (text: string, type: 'email' | 'discord') => {
    try {
      await navigator.clipboard.writeText(text);
      const message = type === 'email' 
        ? 'Email copied to clipboard' 
        : 'Discord tag copied to clipboard';
      showNotification(message);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.navContainer} {...(Platform.OS === 'web' ? { className: 'nav-container' } : {})}>
          <Text style={styles.logo} {...(Platform.OS === 'web' ? { className: 'logo' } : {})}>dinonuwg</Text>
          {!isMobile ? (
            <View style={styles.navLinks} {...(Platform.OS === 'web' ? { className: 'nav-links' } : {})}>
              {['hero', 'about', 'interests', 'projects', 'contact'].map((section) => (
                <Hoverable
                  key={section}
                  onPress={() => scrollToSection(section)}
                  style={styles.navLinkContainer}
                  onLayout={(e: any) => {
                    const { x, width: w } = e.nativeEvent.layout;
                    setNavPositions(prev => {
                      const existing = prev[section];
                      if (existing && existing.x === x && existing.width === w) return prev;
                      return { ...prev, [section]: { x, width: w } };
                    });
                  }}
                  {...(Platform.OS === 'web' ? { className: 'nav-link-container' } : {})}
                >
                  <Text
                    style={[styles.navLink, activeSection === section && styles.activeNavLink]}
                    {...(Platform.OS === 'web' ? { className: 'nav-link', 'data-section': section } as any : {})}
                    onLayout={(e: any) => {
                      const { x: tx, width: tw } = e.nativeEvent.layout;
                      setNavPositions(prev => {
                        const existing = prev[section];
                        if (existing && existing.textWidth === tw && existing.textX === tx) return prev;
                        return { ...prev, [section]: { x: existing?.x ?? 0, width: existing?.width ?? tw, textWidth: tw, textX: tx } };
                      });
                    }}
                  >
                    {section === 'hero' ? 'Home' : section.charAt(0).toUpperCase() + section.slice(1)}
                  </Text>
                </Hoverable>
              ))}

              {/* Underline sits absolutely inside navLinks container */}
              <Animated.View style={[styles.navUnderline, { left: navUnderlineLeft, width: navUnderlineWidth }]} />
            </View>
          ) : (
            <View style={styles.hamburgerContainer}>
              <Pressable onPress={menuOpen ? closeMenu : openMenu} style={styles.hamburgerButton}>
                <View style={styles.hamburgerLine} />
                <View style={[styles.hamburgerLine, { width: 18 }]} />
                <View style={[styles.hamburgerLine, { width: 14 }]} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Mobile menu overlay */}
        {isMobile && menuOpen && (
          <Animated.View style={[styles.mobileMenu, { height: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }) }]}>
            {['hero', 'about', 'interests', 'projects', 'contact'].map((section) => (
              <Pressable key={section} onPress={() => { scrollToSection(section); closeMenu(); }} style={styles.mobileMenuItem}>
                <Text style={styles.mobileMenuText}>{section === 'hero' ? 'Home' : section.charAt(0).toUpperCase() + section.slice(1)}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
  {/* Hero Section */}
  <View style={styles.section} onLayout={(e:any) => { const y = e.nativeEvent.layout.y; setSectionOffsets(s=> ({ ...s, hero: y })); }}>
          <View style={[styles.heroContent, isMobile && styles.heroContentMobile]}>
            <Animated.Image
              source={require('./assets/pfp2.png')}
              style={[
                styles.heroImage,
                isMobile && styles.heroImageMobile,
                {
                  opacity: heroImageAnim,
                  transform: [
                    { scale: heroImageAnim },
                    { translateY: heroImageFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }
                  ]
                }
              ]}
            />
            <Animated.Text 
              style={[
                styles.heroTitle,
                isMobile && styles.heroTitleMobile,
                {
                  opacity: heroTitleAnim,
                  transform: [{ translateY: heroTitleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                }
              ]}
              {...(Platform.OS === 'web' ? { className: 'hero-title' } : {})}
            >
              {typedText}<Animated.Text style={[styles.cursor, { opacity: cursorBlink }]}>|</Animated.Text>
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.heroSubtitle,
                isMobile && styles.heroSubtitleMobile,
                {
                  opacity: heroSubtitleAnim,
                  transform: [{ translateY: heroSubtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                }
              ]}
              {...(Platform.OS === 'web' ? { className: 'hero-subtitle' } : {})}
            >
              Having fun with Programming | UI Design | Software Development
            </Animated.Text>
            <Animated.View 
              style={[
                styles.heroButtons,
                isMobile && styles.heroButtonsMobile,
                {
                  opacity: heroButtonsAnim,
                  transform: [{ translateY: heroButtonsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                }
              ]}
              {...(Platform.OS === 'web' ? { className: 'hero-buttons' } : {})}
            >
              <Hoverable onPress={() => scrollToSection('about')} style={[styles.ctaButton, isMobile && styles.ctaButtonMobile]} hoverStyle={{ color: '#fff', backgroundColor: '#111' }}>
                <Text style={[styles.ctaButtonText, isMobile && styles.ctaButtonTextMobile]}>Learn More</Text>
              </Hoverable>
              <Hoverable onPress={() => scrollToSection('contact')} style={[styles.ctaButton, styles.ctaButtonSecondary, isMobile && styles.ctaButtonMobile]} hoverStyle={{ color: '#000', backgroundColor: '#fff' }}>
                <Text style={[styles.ctaButtonTextSecondary, isMobile && styles.ctaButtonTextMobile]}>Contact Info</Text>
              </Hoverable>
            </Animated.View>
          </View>
        </View>

  {/* About Section */}
  <View style={styles.section} onLayout={(e:any) => { const y = e.nativeEvent.layout.y; setSectionOffsets(s=> ({ ...s, about: y })); }}>
          <View style={styles.sectionContainer}>
            <Animated.Text 
              style={[styles.sectionTitle, { opacity: aboutTitleAnim, transform: [{ scale: aboutTitleAnim }] }]}
              {...(Platform.OS === 'web' ? { className: 'section-title' } : {})}
            >
              About Me
            </Animated.Text>
            <View style={[styles.aboutRow, isMobile && styles.aboutRowMobile]} {...(Platform.OS === 'web' ? { className: 'about-row' } : {})}>
              <Animated.View 
                style={[styles.aboutTextContainer, isMobile && styles.aboutTextContainerMobile, { 
                  opacity: aboutTextAnim, 
                  transform: [{ translateX: aboutTextAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] 
                }]}
                {...(Platform.OS === 'web' ? { className: 'about-text-container' } : {})}
              >
                <Text style={[styles.aboutText, isMobile && styles.aboutTextMobile]}>
                  Hello! I'm dinonuwg, passionate about having fun with programming, UI design, and software development.
                  These are my main interests, and I'm eager to learn and grow in these fields.
                </Text>
                <Text style={[styles.aboutText, isMobile && styles.aboutTextMobile]}>
                  When I'm not working on projects, I enjoy exploring new technologies.
                </Text>
              </Animated.View>
              <Animated.Image
                source={require('./assets/pfp.png')}
                style={[styles.aboutImage, isMobile && styles.aboutImageMobile, { 
                  opacity: aboutImageAnim,
                  transform: [{ translateX: aboutImageAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] 
                }]}
                {...(Platform.OS === 'web' ? { className: 'about-image' } : {})}
              />
            </View>
          </View>
        </View>

  {/* Interests Section */}
  <View style={styles.section} onLayout={(e:any) => { const y = e.nativeEvent.layout.y; setSectionOffsets(s=> ({ ...s, interests: y })); }}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} {...(Platform.OS === 'web' ? { className: 'section-title' } : {})}>My Interests</Text>
            <View style={styles.interestsGrid} {...(Platform.OS === 'web' ? { className: 'interests-grid' } : {})}>
              {[
                { title: 'Programming', desc: 'Having fun building applications and solving problems through code.' },
                { title: 'UI Design', desc: 'Creating intuitive and beautiful user interfaces.' },
                { title: 'Software Development', desc: 'Developing innovative software solutions.' },
              ].map((interest, index) => (
                <Animated.View 
                  key={index} 
                  style={[styles.interestCard, { 
                    opacity: interestAnims[index], 
                    transform: [{ translateY: interestAnims[index].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] 
                  }]}
                  {...(Platform.OS === 'web' ? { className: 'interest-card' } : {})}
                >
                  <Text style={styles.interestTitle}>{interest.title}</Text>
                  <Text style={styles.cardText}>{interest.desc}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>

  {/* Projects Section */}
  <View style={styles.section} onLayout={(e:any) => { const y = e.nativeEvent.layout.y; setSectionOffsets(s=> ({ ...s, projects: y })); }}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} {...(Platform.OS === 'web' ? { className: 'section-title' } : {})}>Projects</Text>
            <View style={styles.projectsGrid} {...(Platform.OS === 'web' ? { className: 'projects-grid' } : {})}>
              {projects.map((project, index) => (
                <Animated.View 
                  key={index} 
                  style={[styles.projectCard, { 
                    opacity: projectAnims[index] || 0, 
                    transform: [{ translateY: (projectAnims[index] || new Animated.Value(0)).interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] 
                  }]}
                  {...(Platform.OS === 'web' ? { className: 'project-card' } : {})}
                >
                  <Image
                    source={{ uri: project.image || 'https://via.placeholder.com/200x200/ffffff/000000?text=Project' }}
                    style={styles.projectImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.projectTitle}>{project.name}</Text>
                  <Text style={styles.cardText}>{project.description}</Text>
                  <Hoverable onPress={() => Linking.openURL(project.url)} style={styles.projectLinkButton} hoverStyle={{ color: '#ffcc00', backgroundColor: 'rgba(255,204,0,0.06)' }}>
                    <Text style={styles.projectLink}>View on GitHub</Text>
                  </Hoverable>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>

  {/* Contact Section */}
  <View style={styles.section} onLayout={(e:any) => { const y = e.nativeEvent.layout.y; setSectionOffsets(s=> ({ ...s, contact: y })); }}>
          <Animated.View style={[styles.sectionContainer, { 
            opacity: contactAnim, 
            transform: [{ scale: contactAnim }] 
          }]}>
            <Text style={styles.sectionTitle} {...(Platform.OS === 'web' ? { className: 'section-title' } : {})}>Contact Me</Text>
            <View style={styles.contactContent} {...(Platform.OS === 'web' ? { className: 'contact-content' } : {})}>
              <Hoverable style={styles.contactButton} onPress={() => copyToClipboard('dinonuwg@gmail.com', 'email')} hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <Image source={require('./assets/mail.png')} style={styles.contactIcon} />
              </Hoverable>
              <Hoverable style={styles.contactButton} onPress={() => copyToClipboard('dinonuwg', 'discord')} hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <Image source={require('./assets/discord.png')} style={styles.contactIcon} />
              </Hoverable>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View 
          style={[
            styles.footer, 
            { 
              opacity: footerAnim, 
              transform: [{ translateY: footerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] 
            }
          ]}
        >
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>&copy; 2025 dinonuwg. All rights reserved.</Text>
            <View style={styles.socialLinks} {...(Platform.OS === 'web' ? { className: 'social-links' } : {})}>
              <Hoverable onPress={() => Linking.openURL('https://github.com/dinonuwg')} style={styles.socialButton} hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' }} pressStyle={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                <Text style={styles.socialLink}>GitHub</Text>
              </Hoverable>
              <Hoverable onPress={() => copyToClipboard('dinonuwg@gmail.com', 'email')} style={styles.socialButton} hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' }} pressStyle={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                <Text style={styles.socialLink}>Email</Text>
              </Hoverable>
              <Hoverable onPress={() => copyToClipboard('dinonuwg', 'discord')} style={styles.socialButton} hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' }} pressStyle={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                <Text style={styles.socialLink}>Discord</Text>
              </Hoverable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <StatusBar style="light" />

      {/* Copy Notification */}
      {notification !== '' && (
        <Animated.View style={[styles.notification, { transform: [{ translateX: notificationSlide }] }]}>
          <Text style={styles.notificationText}>{notification}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
    ...Platform.select({
      web: {
        scrollbarWidth: 'thin',
        scrollbarColor: '#555 #000',
      },
    }),
  },
  navbar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 999,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  navLinks: {
    flexDirection: 'row',
    position: 'relative',
  },
  navLinkContainer: {
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingBottom: 6,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  navLink: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
    alignSelf: 'center',
  },
  activeNavLink: {
    color: '#999',
  },
  navUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#fff',
    transformOrigin: 'left',
    ...Platform.select({ web: { transition: 'width 200ms cubic-bezier(.2,.8,.2,1)' } as any }),
  },
  hamburgerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerButton: {
    padding: 8,
  ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  hamburgerLine: {
    height: 2,
    backgroundColor: '#fff',
    width: 22,
    marginVertical: 2,
  },
  mobileMenu: {
    position: 'absolute',
    top: 64,
    right: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 1000,
  },
  mobileMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    alignItems: 'center',
  },
  mobileMenuText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  /* Mobile overrides */
  heroContentMobile: {
    maxWidth: '100%',
    paddingHorizontal: 12,
  },
  heroImageMobile: {
    width: 88,
    height: 88,
    borderRadius: 12,
    marginBottom: 18,
  },
  heroTitleMobile: {
    fontSize: 36,
    marginBottom: 8,
  },
  heroSubtitleMobile: {
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  heroButtonsMobile: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    alignItems: 'stretch',
  },
  ctaButtonMobile: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  ctaButtonTextMobile: {
    fontSize: 16,
  },
  aboutRowMobile: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  aboutTextContainerMobile: {
    padding: 20,
    width: '100%',
  },
  aboutTextMobile: {
    fontSize: 15,
    lineHeight: 22,
  },
  aboutImageMobile: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  section: {
    minHeight: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionContainer: {
    width: '100%',
    maxWidth: 1200,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 800,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  cursor: {
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      } as any,
    }),
    ...Platform.select({ web: { boxShadow: '0px 4px 6px rgba(0,0,0,0.3)' } as any }),
  },
  ctaButtonSecondary: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  ctaButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ctaButtonTextSecondary: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 48,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    width: '100%',
  },
  aboutTextContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    padding: 32,
  },
  aboutText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 27,
    marginBottom: 24,
  },
  aboutImage: {
    width: '100%',
    maxWidth: 275,
    height: 275,
    borderRadius: 15,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
    width: '100%',
  },
  interestCard: {
    width: '100%',
    maxWidth: 550,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  ...Platform.select({ web: { boxShadow: '0px 6px 8px rgba(0,0,0,0.3)' } as any }),
  },
  interestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
    textAlign: 'center',
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
    width: '100%',
  },
  projectCard: {
    width: '100%',
    maxWidth: 350,
    minHeight: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  ...Platform.select({ web: { boxShadow: '0px 6px 8px rgba(0,0,0,0.3)' } as any }),
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectImage: {
    width: '100%',
    maxWidth: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  projectLinkButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  marginTop: 'auto',
  alignSelf: 'center',
    borderRadius: 12,
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  projectLink: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    maxWidth: 600,
    // allow wrapping and inner padding so items can stack nicely on small screens
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    ...(width < 430 ? { flexDirection: 'column', gap: 20 } : {}),
  },
  emailContact: {
    paddingVertical: 12,
  },
  emailText: {
    fontSize: 20,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  discordText: {
    fontSize: 20,
    color: '#fff',
  },
  footer: {
    width: '100%',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    borderTopWidth: 2,
    borderTopColor: '#222',
    alignItems: 'center',
  },
  footerContainer: {
    width: '100%',
    maxWidth: 1200,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    marginBottom: 24,
    fontSize: 14,
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  ...Platform.select({ web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.3)' } as any }),
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  socialLink: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notification: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2000,
  ...Platform.select({ web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.5)' } as any }),
  },
  notificationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  width: 140,
  height: 140,
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  scrollContent: {
    alignItems: 'center',
    width: '100%'
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactIcon: {
    width: 80,
    height: 80,
    ...(width < 430 ? { width: 64, height: 64 } : {}),
  },
});

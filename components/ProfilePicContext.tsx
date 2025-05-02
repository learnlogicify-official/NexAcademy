"use client"
import React, { createContext, useContext, useState } from "react";

interface ProfilePicContextType {
  profilePic: string;
  setProfilePic: (url: string) => void;
  bannerImage: string;
  setBannerImage: (url: string) => void;
}

const ProfilePicContext = createContext<ProfilePicContextType>({
  profilePic: "",
  setProfilePic: () => {},
  bannerImage: "",
  setBannerImage: () => {},
});

export const useProfilePic = () => useContext(ProfilePicContext);

export const ProfilePicProvider = ({ children, initialPic, initialBanner }: { children: React.ReactNode; initialPic: string; initialBanner: string }) => {
  const [profilePic, setProfilePic] = useState(initialPic);
  const [bannerImage, setBannerImage] = useState(initialBanner);
  return (
    <ProfilePicContext.Provider value={{ profilePic, setProfilePic, bannerImage, setBannerImage }}>
      {children}
    </ProfilePicContext.Provider>
  );
}; 
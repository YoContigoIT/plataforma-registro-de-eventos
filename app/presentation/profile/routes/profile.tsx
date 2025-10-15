import { getProfileLoader } from "../api/get-profile.loader";
import { updateProfileAction } from "../api/update-profile.action";
import ProfileContent from "../components/profile-content";
import ProfileHeader from "../components/profile-header";

export const loader = getProfileLoader;
export const action = updateProfileAction;

export default function Profile() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <ProfileHeader />
      <ProfileContent />
    </div>
  );
}

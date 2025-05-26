<script setup lang="ts">
import { ref } from "vue";
import IconUsers from "@/components/ui/icons/IconUsers.vue";
import IconPlus from "@/components/ui/icons/IconPlus.vue";
import IconTag from "@/components/ui/icons/IconTag.vue";
import IconSettings from "@/components/ui/icons/IconSettings.vue";
import IconFacebook from "@/components/ui/icons/IconFacebook.vue";
import IconInstagram from "@/components/ui/icons/IconInstagram.vue";
import IconLinkedin from "@/components/ui/icons/IconLinkedin.vue";
import IconYoutube from "@/components/ui/icons/IconYoutube.vue";
import IconTwitter from "@/components/ui/icons/IconTwitter.vue";

const selectedChannel = ref("all");

const connectedAccounts = [
  {
    id: "twitter-1",
    name: "gaxown07",
    platform: "Twitter",
    avatar: "/placeholder.svg?height=32&width=32",
    postCount: 0,
    verified: true,
  },
  {
    id: "instagram-1",
    name: "BassamLahe97858",
    platform: "Instagram",
    avatar: "/placeholder.svg?height=32&width=32",
    postCount: 0,
    verified: false,
  },
];

const availablePlatforms = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    color: "text-blue-600",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    color: "text-pink-600",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    color: "text-blue-700",
  },
  { id: "youtube", name: "YouTube", icon: "youtube", color: "text-red-600" },
  { id: "twitter", name: "Twitter", icon: "twitter", color: "text-blue-500" },
];

const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    Twitter: "bg-blue-500",
    Instagram: "bg-pink-500",
    Facebook: "bg-blue-600",
    LinkedIn: "bg-blue-700",
  };
  return colors[platform] || "bg-gray-500";
};

const connectPlatform = (platform: any) => {
  alert(`Connecting to ${platform.name}...`);
};

const setSelectedChannel = (channelId: string) => {
  selectedChannel.value = channelId;
};

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    linkedin: IconLinkedin,
    youtube: IconYoutube,
    twitter: IconTwitter,
  };
  return iconMap[iconName];
};
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 min-h-screen">
    <div class="p-4">
      <!-- Channels Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Channels</h2>
        <button class="p-1 hover:bg-gray-100 rounded">
          <IconPlus class="w-4 h-4" />
        </button>
      </div>

      <!-- All Channels -->
      <div class="mb-6">
        <button
          @click="setSelectedChannel('all')"
          :class="[
            'w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors',
            selectedChannel === 'all'
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-50',
          ]"
        >
          <div
            class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <IconUsers class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1">
            <div class="font-medium">All Channels</div>
          </div>
          <span class="text-sm text-gray-500">{{
            connectedAccounts.length
          }}</span>
        </button>
      </div>

      <!-- Connected Accounts -->
      <div class="space-y-2 mb-6">
        <div
          v-for="account in connectedAccounts"
          :key="account.id"
          @click="setSelectedChannel(account.id)"
          :class="[
            'flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors',
            selectedChannel === account.id
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-50',
          ]"
        >
          <div class="relative">
            <img
              :src="account.avatar || '/placeholder.svg'"
              :alt="account.name"
              class="w-8 h-8 rounded-full"
            />
            <div
              :class="[
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                getPlatformColor(account.platform),
              ]"
            >
              <div
                v-if="account.verified"
                class="w-2 h-2 bg-white rounded-full"
              ></div>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm truncate">{{ account.name }}</div>
            <div class="text-xs text-gray-500">{{ account.platform }}</div>
          </div>
          <span class="text-sm text-gray-500">{{ account.postCount }}</span>
        </div>
      </div>

      <!-- Connect New Accounts -->
      <div class="space-y-2 mb-6">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Connect Accounts</h3>
        <button
          v-for="platform in availablePlatforms"
          :key="platform.id"
          @click="connectPlatform(platform)"
          class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div
            class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <component
              :is="getIconComponent(platform.icon)"
              :class="[`w-4 h-4 ${platform.color}`]"
            />
          </div>
          <span class="text-sm text-gray-700">Connect {{ platform.name }}</span>
        </button>
      </div>

      <!-- Management Options -->
      <div class="border-t border-gray-200 pt-4 space-y-2">
        <button
          class="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <IconTag class="w-4 h-4 text-gray-500" />
          <span class="text-sm text-gray-700">Manage Tags</span>
        </button>
        <button
          class="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <IconSettings class="w-4 h-4 text-gray-500" />
          <span class="text-sm text-gray-700">Manage Channels</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Optional: Add any component-specific styles here if needed */
</style>

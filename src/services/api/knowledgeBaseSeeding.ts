
import { supabase } from '@/lib/supabase';
import { createSuccessResponse, createErrorResponse, ApiResponse } from './base.api';

// Function to seed the knowledge base with PPN data
export const seedPPNKnowledgeBase = async (userId: string): Promise<ApiResponse<{ count: number }>> => {
  try {
    // Collection information
    const collectionEntries = [
      {
        title: 'PPN Collection - Open Palette',
        content: `Open Palette is an inclusive curated collection of PPN members. Link: https://objkt.com/collections/KT1MAkWsXgubfQz7tcJ7z1jpCwPN77r7arDv
        Description: Inclusive curated collection of PPN members, let us know if you want to get some artwork in Open Palette in the Lounge and the team will help directly!
        Average Price: ~10 XTZ (below $10)
        Total Volume: 440.98 XTZ
        Artist Split: 75%
        Community Wallet: 25%`,
        user_id: userId
      },
      {
        title: 'PPN Collection - Pixel Bytes',
        content: `Pixel Bytes is a passive collaboration collection. Link: https://objkt.com/collections/KT1BWqCH2umVcZX5XEob3c8JWnWwYuVk7M6A
        Description: Passive collabration collection, submit a Pixel Byte in our Discord server or buy a Pixel Byte on OBJKT to get involved today!
        Average Price: ~2 XTZ (below $2)
        Total Volume: 194.28 XTZ
        Artist Split: 50%
        Community Wallet: 50%`,
        user_id: userId
      },
      {
        title: 'PPN Collection - Byte Blends',
        content: `Byte Blends are unique digital art pieces resulting from passive collaboration. Link: https://objkt.com/collections/KT1XbDyADEDfK7ND3fMPxQ581EtvEXWrHmWL
        Description: Unique digital art pieces that are the result of passive collabration from PPN members, blending various styles and techniques.
        Average Price: ~5 to 13 XTZ (under $13)
        Total Volume: 709.75 XTZ
        Artist Split: 80%
        Community Wallet: 20%`,
        user_id: userId
      },
      {
        title: 'PPN Collection - Spotlight Artist',
        content: `Spotlight Artist features works from selected digital artists in 2024. Link: https://objkt.com/collections/KT1W87DiAiAqskkgTc1PqDFNS7LqdjSGRb5u
        Description: Featured works from selected digital artists in 2024.
        Average Price: ~5 to 15 XTZ (less than $15)
        Total Volume: 561.39 XTZ
        Artist Split: 90%
        Community Wallet: 10%`,
        user_id: userId
      },
      {
        title: 'PPN Collection - Elegance & Chaos',
        content: `Elegance & Chaos is premium digital art showcasing harmony. Link: https://foundation.app/gallery/elegance-chaos-ppn
        Description: Premium digital art showcasing the harmony of elegance and chaos.
        Average Price: ~0.08 ETH (low hundreds of USD)
        Total Volume: 0.4561 ETH
        Artist Split: 80%
        Community Wallet: 20%
        Additional Info: Five 1/1 NFTs sold`,
        user_id: userId
      },
      {
        title: 'PPN Collection - Crypto Lore',
        content: `Crypto Lore is an exclusive digital art collection inspired by blockchain. Link: https://foundation.app/gallery/crypto-lore/exhibition/977
        Description: Exclusive digital art collection inspired by blockchain and crypto major headlines from the inception of BTC to the launch of runes and defi.
        Average Price: ~0.04 ETH (excluding 0.20 ETH outlier)
        Total Volume: 0.0825 ETH
        Artist Split: 80%
        Community Wallet: 20%`,
        user_id: userId
      }
    ];
    
    // Organization information
    const organizationEntries = [
      {
        title: 'About Pixel Palette Nation (PPN)',
        content: `Pixel Palette Nation (PPN) is a nonprofit dedicated to advancement of the digital art space, providing education, exposure, and community support for digital artists.
        Values:
        - Artist-first approach
        - Community-driven initiatives
        - Educational support`,
        user_id: userId
      },
      {
        title: 'PPN Key Differentiators - Community Focus',
        content: `Community Focus: Sales proceeds are reinvested in community engagement initiatives (contests, giveaways) and educational programs rather than for-profit. You can donate to PPN directly on our website or buy some artwork from our collections to help support our mission.`,
        user_id: userId
      },
      {
        title: 'PPN Key Differentiators - Artist-Centric Model',
        content: `Artist-Centric Model: Royalty structures are designed to maximize the portion of sale proceeds that go directly to the artists/members with a small % for PPN to continue to support our members.`,
        user_id: userId
      },
      {
        title: 'PPN Key Differentiators - Noncommercial Approach',
        content: `Noncommercial Approach: After minting and promotional support via social media, direct involvement ends—we do not take ownership of the artworks nor seek to resell them for profit, unlike traditional commercial galleries.`,
        user_id: userId
      },
      {
        title: 'PPN Community Wallet Purpose',
        content: `The PPN community wallet funds:
        - Community engagement initiatives
        - Educational programs
        - Contests and giveaways
        - Resources for artists
        - Artist and member promotion
        - Support for partners`,
        user_id: userId
      }
    ];
    
    // Marketing strategies
    const marketingEntries = [
      {
        title: 'PPN Marketing Strategies',
        content: `Marketing strategies for digital artists:
        - Leverage social media platforms for artwork promotion, get involved on the TL dont just scroll!
        - Engage with the digital art community through Discord communities and artists on social media
        - Create educational content about digital art and NFTs
        - Collaborate with other artists and communities, our Pixel Bytes collection is a fantastic place to start getting to know some artists!
        - Understand PPN's unique royalty and community support model that come with minting into our collections
        - Leverage PPN's nonprofit approach to build a larger base in the art community`,
        user_id: userId
      }
    ];
    
    // Narrative development
    const narrativeEntries = [
      {
        title: 'PPN Narrative Development Strategies',
        content: `Strategies to develop your artistic narrative:
        - Craft compelling stories behind your artwork rather than just something that looks cool
        - Build a consistent artistic identity through the medium or style of artwork you showcase online
        - Document your creative process with pictures and video, then make a fun video of how you work
        - Connect your art to broader themes or movements in your culture
        - Align your artistic journey with something that is close to your heart
        - Use the web3 space as inspiration for your artwork`,
        user_id: userId
      }
    ];
    
    // Collection recommendations
    const recommendationEntries = [
      {
        title: 'PPN Collection Recommendations - Pixel Art',
        content: `For pixel art or 8-bit style artists, we recommend Pixel Bytes. Perfect way for you to grow your network and skills. This collection is minted on Tezos and offers vibrant community collaboration. If you buy another artist's Pixel Byte, you will get an invite to "Byte Blends" to mint a collab piece from the Pixel Byte you purchased. Collection link: https://objkt.com/collections/KT1BWqCH2umVcZX5XEob3c8JWnWwYuVk7M6A`,
        user_id: userId
      },
      {
        title: 'PPN Collection Recommendations - Abstract/Experimental',
        content: `For abstract or experimental digital artists, we recommend Byte Blends. Great for growth in the digital art space as well as experimental digital artwork. Discover innovative techniques and collaborative art in this collection. Collection link: https://objkt.com/collections/KT1XbDyADEDfK7ND3fMPxQ581EtvEXWrHmWL`,
        user_id: userId
      },
      {
        title: 'PPN Collection Recommendations - Premium',
        content: `For premium or high-end digital art, we recommend Elegance & Chaos. Ideal for premium digital art with higher price points, offering exclusive minting experiences and limited editions.`,
        user_id: userId
      },
      {
        title: 'PPN Collection Recommendations - General',
        content: `For all digital artists, we recommend Open Palette. Our main community collection, open to diverse art styles and a great starting point for every artist. Currently available on Tezos and Sol for artists to mint into. Collection link: https://objkt.com/collections/KT1MAkWsXgubfQz7tcJ7z1jpCwPN77r7arDv`,
        user_id: userId
      }
    ];
    
    // Combine all entries
    const allEntries = [
      ...collectionEntries,
      ...organizationEntries,
      ...marketingEntries,
      ...narrativeEntries,
      ...recommendationEntries
    ];
    
    // Insert all knowledge base entries
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(allEntries);
      
    if (error) {
      console.error('Error seeding PPN knowledge base:', error);
      return createErrorResponse('Failed to seed PPN knowledge base', error);
    }
    
    return createSuccessResponse({ count: allEntries.length });
  } catch (error) {
    console.error('Error in seedPPNKnowledgeBase:', error);
    return createErrorResponse('Failed to seed PPN knowledge base', error);
  }
};

// Export knowledge base seeding functions
export const knowledgeBaseSeeding = {
  seedPPNKnowledgeBase
};

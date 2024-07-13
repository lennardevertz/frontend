import { useState, useEffect } from 'react';

import type { AddressMetadataTag } from 'types/api/addressMetadata';
import type { AddressMetadataInfoFormatted, AddressMetadataTagFormatted } from 'types/client/addressMetadata';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import getIDriss from 'lib/web3/idriss';

import parseMetaPayload from './parseMetaPayload';

export default function useAddressMetadataInfoQuery(addresses: Array<string>, isEnabled = true) {
  const [ resolvedTags, setResolvedTags ] = useState<Record<string, AddressMetadataTag | null>>({});

  useEffect(() => {
    async function fetchTags() {
      const tags = await Promise.all(
        addresses.map(async(address) => {
          const tag = await getIDriss(address);
          return { address, tag };
        }),
      );

      const tagsMap = tags.reduce((acc, { address, tag }) => {
        acc[address] = tag;
        return acc;
      }, {} as Record<string, AddressMetadataTag | null>);

      setResolvedTags(tagsMap);
    }

    if (isEnabled && addresses.length > 0) {
      fetchTags();
    }
  }, [ addresses, isEnabled ]);

  const resource = 'address_metadata_info';

  return useApiQuery<typeof resource, unknown, AddressMetadataInfoFormatted>(resource, {
    queryParams: {
      addresses,
      chainId: config.chain.id,
      tagsLimit: '20',
    },
    queryOptions: {
      enabled: isEnabled && addresses.length > 0 && config.features.addressMetadata.isEnabled,
      select: (data) => {
        const addresses = Object.entries(data.addresses)
          .map(([ address, { tags, reputation } ]) => {
            const newTag = resolvedTags[address];
            const tagsNew: Array<AddressMetadataTag> = newTag ? [ ...tags, newTag ] : tags;

            const formattedTags: Array<AddressMetadataTagFormatted> = tagsNew.map((tag) => ({
              ...tag,
              meta: parseMetaPayload(tag.meta),
            }));
            return [ address.toLowerCase(), { tags: formattedTags, reputation } ] as const;
          })
          .reduce((result, item) => {
            result[item[0]] = item[1];
            return result;
          }, {} as AddressMetadataInfoFormatted['addresses']);

        return { addresses };
      },
    },
  });
}

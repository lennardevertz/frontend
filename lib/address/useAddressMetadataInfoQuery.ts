import type { AddressMetadataTag } from 'types/api/addressMetadata';
import type { AddressMetadataInfoFormatted, AddressMetadataTagFormatted } from 'types/client/addressMetadata';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';

import parseMetaPayload from './parseMetaPayload';

export default function useAddressMetadataInfoQuery(addresses: Array<string>, isEnabled = true) {

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
            // const newTag = await getIDriss(address);
            const newTag: AddressMetadataTag = {
              slug: 'idriss-handle',
              name: 'IDriss',
              tagType: 'protocol',
              ordinal: 0,
              meta: JSON.stringify(
                {
                  bgColor: '#11dd74',
                  // eslint-disable-next-line max-len
                  tagIcon: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMDAgOTM0IiB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE0MCI+Cgk8dGl0bGU+SURyaXNzX0JyYW5kbWFya19XaGl0ZS1zdmc8L3RpdGxlPgoJPHN0eWxlPgoJCS5zMCB7IGZpbGw6ICNmZmZmZmYgfSAKCQkuczEgeyBmaWxsOiAjMTFkZDc0IH0gCgk8L3N0eWxlPgoJPHBhdGggaWQ9IlNoYXBlIDUiIGNsYXNzPSJzMCIgZD0ibTgzOC44IDgwOS44Yy00My40IDc1LTEyMy41IDEyMS4zLTIxMC4yIDEyMS4zaC0yNTcuM2MtODYuNyAwLTE2Ni44LTQ2LjMtMjEwLjItMTIxLjNsLTEyOC43LTIyMi45Yy00My4yLTc1LjEtNDMuMi0xNjcuNiAwLTI0Mi43bDEyOC43LTIyMi45YzQzLjQtNzUgMTIzLjUtMTIxLjMgMjEwLjItMTIxLjNoMjU3LjNjODYuNyAwIDE2Ni44IDQ2LjMgMjEwLjIgMTIxLjNsMTI4LjcgMjIyLjljNDMuNCA3NS4xIDQzLjQgMTY3LjYgMCAyNDIuN3oiLz4KCTxwYXRoIGlkPSJJRCAiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xhc3M9InMxIiBkPSJtMjM5LjMgMjY5LjZoMTEwLjZ2MzkxaC0xMTAuNnptMTg5LjQgMGgxODQuOWMxMjkuNiAwIDIxOC40IDc1LjUgMjE4LjQgMTk1LjYgMCAxMjAuMS04OC44IDE5NS41LTIxOC40IDE5NS41aC0xODQuOXptMTgwLjQgMzAyLjhjNjYuNSAwIDExMS4yLTM5LjcgMTExLjItMTA3LjMgMC02Ny42LTQ0LjctMTA3LjMtMTExLjItMTA3LjNoLTY5Ljh2MjE0LjZ6Ii8+Cjwvc3ZnPg==',
                  textColor: '#FFFFFF',
                  tooltipDescription: 'This address is linked to an IDriss',
                  idrissHandle: 'geoist_',
                }),
            };

            const tagsNew: Array<AddressMetadataTag> = [ ...tags, newTag ];
            const formattedTags: Array<AddressMetadataTagFormatted> = tagsNew.map((tag) => ({ ...tag, meta: parseMetaPayload(tag.meta) }));
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

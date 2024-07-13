import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

import type { AddressMetadataTag } from 'types/api/addressMetadata';

const IDRISS_GET_TWITTER_NAME_URL =
  'https://www.idriss.xyz/v1/getTwitterNames?ids=';

const IDRISS_REGISTRY_RESOLVER =
  '0xa179BF6f32483A82d4BD726068EfD93E29f3c930';

const IDRISS_RESOVER_ABI = [
  {
    inputs: [
      {
        internalType: 'string[]',
        name: 'hashes',
        type: 'string[]',
      },
    ],
    name: 'getMultipleIDriss',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: '_hash',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'result',
            type: 'string',
          },
        ],
        internalType: 'struct IDrissWrapperContract.IDrissResult[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    name: 'getMultipleReverse',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: '_address',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'result',
            type: 'string',
          },
        ],
        internalType: 'struct IDrissWrapperContract.IDrissReverseResult[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

interface IDrissReverseResult {
  _address: string;
  result: string;
}

const publicClient = createPublicClient({
  chain: polygon,
  transport: http('https://polygon.llamarpc.com'),
});

const reverseTwitterID = async(id: string): Promise<string> => {
  const response = await fetch(
    IDRISS_GET_TWITTER_NAME_URL + encodeURIComponent(id),
  );
  if (response.status !== 200) {
    throw new Error(
      'IDriss api responded with code ' +
          response.status +
          ' ' +
          response.statusText +
          '\r\n' +
          (await response.text()),
    );
  }
  const jsonResponse = await response.json();
  return jsonResponse.twitterNames[id];
};

export default async function getIDriss(userAddress: string): Promise<AddressMetadataTag | null> {
  try {
    const data: Array<IDrissReverseResult> = await publicClient.readContract({
      address: IDRISS_REGISTRY_RESOLVER,
      abi: IDRISS_RESOVER_ABI,
      functionName: 'getMultipleReverse',
      args: [ [ userAddress ] ],
    });

    let reverseAddress = '';

    for (const { _address, result } of data) {
      if (result && _address === userAddress) {
        reverseAddress = ((await reverseTwitterID(result))).toLowerCase();
        break;
      }
    }

    const resultDefault: AddressMetadataTag = {
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
          idrissHandle: reverseAddress,
        }),
    };
    return resultDefault;
  } catch (error) {
    return null;
  }
}

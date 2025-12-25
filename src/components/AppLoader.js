import {Text} from 'react-native';
import React from 'react';
import textStyles from '../constants/textTheme';
import {
  Center,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  Spinner,
} from '@gluestack-ui/themed';
import {ModalBackdrop} from '@gluestack-ui/themed';
import {scale} from '../constants/matrics';

export default function AppLoader({showModal}) {
  return (
    <>
      <Modal
        isOpen={showModal}
        alignItems={'center'}
        justifyContent={'center'}
        zIndex={1000}>
        <ModalBackdrop />
        <ModalContent width={'auto'} height={'$12'}>
          <ModalBody
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              margin: 0,
              padding: 0,
            }}>
            <HStack
              space="sm"
              justifyContent={'center'}
              flexDirection={'row'}
              alignItems={'center'}
              marginTop={10}
              height={'100%'}>
              {/* <View style={{ flexDirection: 'row' }}> */}
              <Spinner accessibilityLabel="Loading posts" color={'#212f48'} />
              <Text style={{...textStyles.lableMedium, color: '#212f48'}}>
                {'Loading...'}
              </Text>
              {/* </View> */}
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

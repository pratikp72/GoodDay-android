import {View, Text, TouchableOpacity, TextInput, Share,Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  AddIcon,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalHeader,
  useStyled,
  LinkIcon,
  CloseIcon,
  CopyIcon
} from '@gluestack-ui/themed';
import {useToastMessage} from '../hooks/useToastMessage';
import Clipboard from '@react-native-clipboard/clipboard';
import {ModalContent} from '@gluestack-ui/themed';
import {ModalBody} from '@gluestack-ui/themed';
import {ModalFooter} from '@gluestack-ui/themed';
import {Button} from '@gluestack-ui/themed';
import {ButtonText} from '@gluestack-ui/themed';
const CallLinkModal = ({visible, onClose, data}) => {
  console.log(data);
  const [userName, setuserName] = useState('');
  useEffect(() => {
    handleSlugify(data?.Username);
  }, [data]);

  const handleSlugify = str => {
    setuserName(
      str?.length > 0
        ? str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : '',
    );
  };
  const {showToast} = useToastMessage();
  const handleCopy = () => {
    Clipboard.setString(`https://${data?.domain}/facetime/${userName}`);
    showToast({message: 'The URL has been copied to clipboard.'});
  };
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check this out: https://${data?.domain}/facetime/${userName}`,
        url: `https://${data?.domain}/facetime/${userName}`, // This works better on iOS
        title: 'My Cool URL', // iOS only
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };
  return (
    <Modal
      isOpen={visible}
      alignItems={'center'}
      justifyContent={'center'}
      onClose={onClose}>
      <ModalBackdrop />
      <ModalContent width={'90%'} height={'auto'}>
        <ModalHeader width={'100%'} style={{alignItems:'center'}}>
          <Heading size="lg">Call Link</Heading>
          <TouchableOpacity onPress={onClose}>
            <CloseIcon />
          </TouchableOpacity>
        </ModalHeader>
        <ModalBody>
          <View style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
            <Text
              adjustsFontSizeToFit
              style={{
                width: '50%',
              }}>{`https://${data?.domain}/facetime/`}</Text>
            <TextInput
              value={userName}
              onChangeText={handleSlugify}
              style={{borderWidth: 1, borderRadius: 10, flex: 1}}
            />
          </View>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            action="secondary"
            borderWidth="$0"
          style={{gap:5}}
            onPress={handleCopy}>
                <View >
                    <CopyIcon/>
                </View>
            <ButtonText>Copy</ButtonText>
          </Button>
          <Button
            size="sm"
            variant="outline"
            action="secondary"
            borderWidth="$0"
            onPress={handleShare}>
            {/* <ButtonText>SMS</ButtonText>
             */}
             <Image style={{width:50,height:30}} resizeMode='contain' source={{uri:'https://dev.freedom.buzz/assets/images/sms-light.png'}}/>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CallLinkModal;

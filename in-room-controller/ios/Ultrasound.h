#import <React/RCTBridge.h>
#import <React/RCTEventEmitter.h>

@interface Ultrasound : NSObject<RCTBridgeModule>
- (void)play: (NSString *)message;
@end

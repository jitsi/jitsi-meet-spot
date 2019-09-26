/*
 * Copyright 2017 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Copy pasted from [1] and extracted only the Crashlytics related methods.
// If any changes are needed make sure to sync both places.
// [1]: https://github.com/jitsi/jitsi-meet/blob/master/ios/app/src/FIRUtilities.h

#import <Foundation/Foundation.h>

@interface FIRUtilities : NSObject

+ (BOOL)appContainsRealServiceInfoPlist;

@end
